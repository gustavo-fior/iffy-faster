import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "~/utils/api";

import { GitHubLogoIcon } from "@radix-ui/react-icons";

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

  const handleSignIn = (provider: string) => {
    signIn(provider).catch((err) => console.error(err));
  };

  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Iffy faster</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center bg-neutral-900 pt-12">
        <div className="container flex max-w-3xl flex-col justify-center text-neutral-50">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tighter text-neutral-200">
              Iffy but faster
            </h1>
            <button
              className="rounded-md bg-white/10 px-4 py-2 font-normal text-white text-sm transition hover:bg-white/20"
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
          </header>

          <div className="mt-4 rounded-xl bg-neutral-800 p-8 text-4xl text-neutral-200">
            <p className="text-sm text-neutral-400">
              Works just like iffy.com but faster:
              <br />
              <br />
              <code className="whitespace-pre-wrap text-sm text-neutral-200">
                {curlCommand}
              </code>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
