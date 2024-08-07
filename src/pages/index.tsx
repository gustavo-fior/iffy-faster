import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  const curlCommand = `curl https://iffy-faster.vercel.app/api/moderate \\
  -X POST \\
  -H "Content-Type: application/json" \\
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

  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Iffy faster</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900">
        <div className="container flex max-w-2xl flex-col justify-center text-neutral-50">
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-200">
            Iffy but faster
          </h1>
          <div className="mt-4 rounded-xl bg-neutral-800 p-8 text-4xl text-neutral-200">
            <p className="text-sm text-neutral-400">
              Works just like iffy.com but faster:
              <br />
              <br />
              <code className="mt-4 whitespace-pre-wrap text-sm text-neutral-200">
                {curlCommand}
              </code>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-2xl text-white">
            {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
          </p>
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            {sessionData ? "Sign out" : "Sign in"}
          </button>
        </div>
      </main>
    </>
  );
}
