"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useToast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { Toaster } from "~/components/ui/toaster";

function SignInContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    
    if (error === "rate_limit" && message) {
      toast({
        variant: "destructive",
        title: "Rate limit exceeded",
        description: decodeURIComponent(message),
        duration: 4000,
      });
    }
  }, [searchParams, toast]);

  return (
    <Card className="pointer-events-auto mx-auto w-full max-w-[400px]">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold tracking-tight">
          README Generator
        </CardTitle>
        <CardDescription className="text-center">
          Your AI-powered README generator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Why sign in?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                Generate 20 free READMEs per day
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                Save your generated READMEs to your account and access them anytime, anywhere
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                Get notified when new features are added
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => void signIn("google")}
          className="flex w-full items-center justify-center gap-2"
        >
          <Image src="/google.svg" alt="Google" width={16} height={16} />
          Sign in with Google
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <>
      <div className="pointer-events-none -mt-14 flex min-h-screen flex-col items-center justify-center p-4">
        <Suspense>
          <SignInContent />
        </Suspense>
      </div>
      <Toaster />
    </>
  );
}
