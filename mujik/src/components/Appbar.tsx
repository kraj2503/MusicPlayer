"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export function Appbar() {
  const session = useSession();

  return (
    <div className="flex justify-between h-10 bg-red-600 items-center">
      <div>Mujik</div>
      <div>
        {session.data?.user && (
          <button
            onClick={() => signOut()}
            className="m-2 p-2 bg-blue-500 rounded-md"
          >
            Logout
          </button>
        )}
        {!session.data?.user && (
          <button
            onClick={() => signIn()}
            className="m-2 p-2 bg-blue-500 rounded-md"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
