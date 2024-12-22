"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {

  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await signIn("google", {
        redirect: true, 
        callbackUrl: "/dashboard",
      });
      console.log(res);
    } catch (err) {
      return (
        <>Error Signing in {err}</>
      )
    } 
  };

  return (<div className="flex flex-col items-center justify-center h-screen bg-gray-950 ">
      <div className="bg-gray-700 p-6 rounded-xl shadow-md w-96">
        <h1 className="text-xl font-semibold text-center mb-4 text-white">
          Sign In
        </h1>
        <Button  onClick={handleGoogleSignIn} variant="secondary" className="justify-center w-full ">Sign in with Google </Button>
        {/* <button
          // onClick={handleGoogleSignIn}
          className={`w-full flex items-center justify-center p-2  border rounded-md text-black bg-white hover:bg-gray-200 text-md font-semibold  disabled:opacity-50 disabled:cursor-not-allowed `}
        > */}
          {/* <span>Sign in with Google</span> */}
        {/* </button> */}

        <p className="text-sm text-gray-200 text-center mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
