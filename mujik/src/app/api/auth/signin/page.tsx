"use client"
import { signIn } from "next-auth/react";


export default function SignInPage() {
  // const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();


    try {
      const res = await signIn("google", {
        redirect: true, // Automatically redirect after successful sign-in
        callbackUrl: "/dashboard",
      });
      console.log(res);
    } catch (err) {
      return <>ajskdhasd</>;
      console.error("Error during sign-in:", err);
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h1 className="text-xl font-semibold text-center mb-4">Sign In</h1>

        <button
          onClick={handleGoogleSignIn}
         
          className={`w-full flex items-center justify-center p-2 border rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
         
            <span>Sign in with Google</span>
          
        </button>

        <p className="text-sm text-gray-600 text-center mt-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
