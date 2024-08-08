import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "~/utils/api";

import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { CheckIcon, CopyIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Checkbox } from "~/components/ui/checkbox";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";

const curlCommand = `curl https://iffy-faster.vercel.app/api/moderate \\
-X POST \\
-H "Content-Type: application/json" \\
-H "Authorization: [your_token]" \\
-d '{
"content": [
  {
    "type": "text",
    "text": "{\\"type\\":\\"product\\",\\"url\\":\\"goodsnooze.gumroad.com/l/vivid\\",\\"name\\":\\"Vivid - Double your MacBook Pro Brightness\\",\\"description\\":\\"Vivid doubles the brightness of your MacBook Pro across all apps, not just videos! ⚠️ Vivid only works on MacBook Pro with M1/2/3 Pro or Max chips.\\"}"
  },
  {
    "type": "image_url",
    "image_url": {
      "url": "https://public-files.gumroad.com/bbaop6t7ewslyb1q4rdwssyf0yw1"
    }
  }
]
}'`;

export default function Home() {
  const { data: sessionData } = useSession();

  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isFalsePositive, setIsFalsePositive] = useState(false);
  const [guidelines, setGuidelines] = useState("");

  const requests = api.request.list.useQuery();

  const addFeedback = api.request.addFeedback.useMutation({
    onSuccess: () => {
      toast.success("Feedback sent!");
    },
  });

  const addGuidelines = api.users.addGuidelines.useMutation({
    onSuccess: () => {
      toast.success("Guidelines added!");
    },
  });

  const handleSignIn = (provider: string) => {
    signIn(provider).catch((err) => console.error(err));
  };

  const handleAddFeedback = async (requestId: string) => {
    await addFeedback.mutateAsync({
      feedback: feedback,
      falsePositive: isFalsePositive,
      requestId,
    });

    setFeedback("");
    setIsFalsePositive(false);

    await requests.refetch();
  };

  const handleAddGuidelines = async () => {
    await addGuidelines.mutateAsync({
      guidelines,
    });

    setGuidelines("");
  };

  return (
    <>
      <Head>
        <title>Iffy faster</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-neutral-900 pb-24 pt-12">
        <div className="container flex max-w-4xl flex-col justify-center text-neutral-50">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tighter text-neutral-200">
              Iffy but faster
            </h1>
            <div className="flex items-center gap-2">
              {sessionData && (
                <AlertDialog>
                  <AlertDialogTrigger>
                    <button className="rounded-md bg-white/10 px-4 py-2 text-sm font-normal text-white transition hover:bg-white/20">
                      Upload your guidelines
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-neutral-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Guidelines</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p className="mt-2 text-sm text-neutral-400">
                      Add your guidelines in bullet points to use custom rules.
                    </p>
                    <Textarea
                      className="w-full rounded-md bg-neutral-700 px-4 py-2 text-sm text-neutral-200"
                      value={guidelines}
                      onChange={(e) => setGuidelines(e.target.value)}
                    />
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-neutral-600 text-sm text-neutral-200 transition hover:bg-neutral-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleAddGuidelines}
                        className="bg-neutral-200 text-sm text-neutral-700 transition hover:bg-neutral-300"
                      >
                        Add
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <button
                className="rounded-md bg-white/10 px-4 py-2 text-sm font-normal text-white transition hover:bg-white/20"
                onClick={
                  sessionData
                    ? () => void signOut()
                    : () => handleSignIn("github")
                }
              >
                {sessionData ? (
                  "Sign out"
                ) : (
                  <div className="flex items-center gap-2">
                    <p>Sign in with</p>
                    <GitHubLogoIcon className="h-4 w-4" />
                  </div>
                )}
              </button>
            </div>
          </header>

          <div className="mt-4 rounded-xl bg-neutral-800 px-8 py-6 text-4xl text-neutral-200">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-neutral-400">Your token:</p>
                <p className="mt-2 text-sm text-neutral-400">
                  <code className="whitespace-pre-wrap text-sm text-neutral-200">
                    {sessionData
                      ? btoa(sessionData.user.id)
                      : "Sign in to get your token"}
                  </code>
                </p>
              </div>
              {sessionData && (
                <div className="flex items-center">
                  {copied ? (
                    <CheckIcon className="h-6 w-6 text-neutral-400" />
                  ) : (
                    <CopyIcon
                      className="h-6 w-6 text-neutral-400 transition hover:cursor-pointer hover:text-neutral-200"
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          btoa(sessionData.user.id),
                        );

                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-neutral-800 px-8 py-6 text-4xl text-neutral-200">
            <p className="text-sm text-neutral-400">
              Works just like iffy.com but faster:
              <br />
              <br />
              <code className="whitespace-pre-wrap text-sm text-neutral-200">
                {curlCommand}
              </code>
            </p>
          </div>

          {sessionData && (
            <div>
              <h1 className="mt-8 text-2xl font-semibold tracking-tighter text-neutral-200">
                Moderations{" "}
                <p className="inline text-neutral-500">
                  ({requests.data?.length}/20)
                </p>
              </h1>

              <div className="mt-4 overflow-hidden rounded-xl bg-neutral-800">
                <div className="grid grid-cols-12 items-center border-b border-neutral-700 px-2 py-4 text-sm text-neutral-500">
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-6 ml-2">Reasoning</div>
                  <div className="col-span-3 ml-4">Timestamp</div>
                  <div className="col-span-2 text-center">Feedback</div>
                </div>

                {requests.data?.map((request, index) => (
                  <div
                    className={`grid grid-cols-12 items-center px-2 py-4 ${
                      index !== requests.data.length - 1
                        ? "border-b border-neutral-700"
                        : ""
                    }`}
                    key={request.id}
                  >
                    <div className="col-span-1 text-center text-sm">
                      {request.iffy ? "🔞" : "✅"}
                    </div>
                    <div className="col-span-6 ml-2 text-sm text-neutral-200">
                      {request.reasoning}
                    </div>
                    <div className="col-span-3 ml-4 text-sm text-neutral-200">
                      {request.createdAt.toLocaleString()}
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <AlertDialog>
                        <AlertDialogTrigger
                          disabled={request.feedback !== null}
                        >
                          {request.feedback === null ? (
                            <button className="rounded-md bg-neutral-700 px-2 py-1 text-sm text-neutral-200 transition hover:bg-neutral-600">
                              Feedback
                            </button>
                          ) : (
                            <p className="text-sm text-neutral-200">
                              {" "}
                              Thanks :)
                            </p>
                          )}
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-800">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Feedback</AlertDialogTitle>
                          </AlertDialogHeader>
                          <p className="mt-2 text-sm text-neutral-400">
                            Leave a feedback to help us improve this service.
                          </p>
                          <Textarea
                            className="w-full rounded-md bg-neutral-700 px-4 py-2 text-sm text-neutral-200"
                            placeholder="The reasoning makes no sense..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-sm text-neutral-400">
                              Was this a mistake?
                            </p>
                            <Checkbox
                              className="text-neutral-200"
                              checked={isFalsePositive}
                              onCheckedChange={() =>
                                setIsFalsePositive(!isFalsePositive)
                              }
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-neutral-600 text-sm text-neutral-200 transition hover:bg-neutral-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleAddFeedback(request.id)}
                              className="bg-neutral-200 text-sm text-neutral-700 transition hover:bg-neutral-300"
                            >
                              Send
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
