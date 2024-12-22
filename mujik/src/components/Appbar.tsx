"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";

export function Appbar() {
  const session = useSession();

  return (
    <nav className=" w-full bg-gray-900 text-white p-4 shadow-lg border-b border-gray-700 ">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold font-mono tracking-wide">
          Muzly
        </div>

        {/* Authentication Buttons */}
        <div>
          {session.data?.user ? (
            <Button
              variant="secondary"
              onClick={() => signOut({ callbackUrl: 'http://localhost:3000/' })}
              className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300"
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => signIn()}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 rounded-lg text-white font-medium transition-all duration-300"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
