"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function Appbar() {
  const session = useSession();

  return (
    <div className="flex justify-between h-10 bg-blue-800 items-center p-6">
      <div>Mujik</div>
      <div>
        {session.data?.user && (
          <button
            onClick={() => signOut()}
            className="px-4 py-1  bg-blue-500 rounded-md"
          >
            Logout
          </button>
        )}
        {!session.data?.user && (
          <button
            onClick={() => signIn()}
            className="px-4 py-1  bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
