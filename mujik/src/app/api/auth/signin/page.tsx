// app/sign-in/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
       await signIn("google", {
        redirect: true,
        callbackUrl: "/dashboard",
      });
      // console.log(res);
    } catch (err) {
      return <>Error Signing in {err}</>;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96">
        <h1 className="text-3xl font-semibold text-center mb-6 text-white">
          Welcome Back
        </h1>
        <Button
          onClick={handleGoogleSignIn}
          variant="secondary"
          className="w-full flex justify-center py-3 px-6 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all duration-300"
        >
          Sign in with Google
        </Button>

        <p className="text-sm text-gray-300 text-center mt-4">
          By signing in, you agree to our
          <span className="text-blue-400 hover:underline cursor-pointer">
            {" "}
            Terms Service
          </span>
          {" and "}
          <span className="text-blue-400 hover:underline cursor-pointer">
            {" "}
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
