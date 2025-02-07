import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { auth, signIn } from "~/server/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <div className="pointer-events-none -mt-14 flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="pointer-events-auto mx-auto w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Welcome to HackMate
          </CardTitle>
          <CardDescription className="text-center">
            Your AI-powered hackathon companion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Why sign in?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  Save your projects and access them anywhere
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  Auto-fill project details for documentation generator and
                  pitch assistant
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  Automatically create a pull request to GitHub with generated
                  documentation (coming soon!)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <form action={handleSignIn} className="w-full">
            <Button
              type="submit"
              className="flex w-full items-center justify-center gap-2"
            >
              <Image src="/google.svg" alt="Google" width={16} height={16} />
              Sign in with Google
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
