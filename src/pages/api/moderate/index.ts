import { type NextApiRequest, type NextApiResponse } from "next";

import Anthropic from "@anthropic-ai/sdk";
import {
  type ImageBlockParam,
  type TextBlock,
  type TextBlockParam,
  type ToolResultBlockParam,
  type ToolUseBlockParam,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import { fetchImage } from "~/utils/fetchImage";
import { getCustomPrompt, systemPrompt } from "~/utils/prompt";

import { PrismaClient } from "@prisma/client";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const prisma = new PrismaClient();

type ContentItem = {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
};

type AnthropicMessage = {
  content:
    | string
    | Array<
        | TextBlockParam
        | ImageBlockParam
        | ToolUseBlockParam
        | ToolResultBlockParam
      >;
  role: "user" | "assistant";
};

type ModerationResult = {
  iffy: boolean;
  reasoning: string;
};

type RequestBody = {
  content: ContentItem[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ModerationResult>,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  if (!req.headers.authorization) {
    return res.status(401).end();
  }

  const { content } = req.body as RequestBody;

  console.log(content);

  const userId = Buffer.from(req.headers.authorization, "base64").toString(
    "utf-8",
  );

  console.log(userId);

  const requestCount = await prisma.requests.count({
    where: {
      userId,
    },
  });

  console.log(requestCount);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  console.log(user);

  if (requestCount >= 20) {
    return res.status(429).end();
  }

  try {
    const moderatedContent = await moderateContent(content, user?.guidelines);

    void prisma.requests
      .create({
        data: {
          userId,
          iffy: moderatedContent.iffy,
          reasoning: moderatedContent.reasoning,
          falsePositive: false,
        },
      })
      .catch((error) => {
        console.error("Error creating request in database:", error);
      });

    res.status(200).json(moderatedContent);
  } catch (error) {
    console.error("Error moderating content:", error);

    res
      .status(500)
      .json({ iffy: false, reasoning: "Error processing request" });
  }
}

async function moderateContent(
  content: ContentItem[],
  guidelines: string | null | undefined,
): Promise<ModerationResult> {
  const textContent = content.find((item) => item.type === "text");

  const imageContent = content.find((item) => item.type === "image_url");
  const image_url = imageContent?.image_url?.url ?? "";
  const imageData = await fetchImage(image_url);

  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: guidelines ? getCustomPrompt(guidelines) : systemPrompt,
        },
        textContent,
        {
          type: "image",
          source: {
            data: imageData?.base64,
            media_type: imageData?.mimeType,
            type: "base64",
          },
        },
      ],
    },
  ] as AnthropicMessage[];

  const msg = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    temperature: 0.2,
    max_tokens: 128,
    messages: messages,
  });

  const returnMessage = msg.content.at(0) as TextBlock;

  return JSON.parse(returnMessage.text) as ModerationResult;
}
