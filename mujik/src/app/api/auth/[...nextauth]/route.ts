import { prisma } from "@/app/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET??"",
  callbacks: {
    async signIn(params) {
      // console.log("Params: ",params);
      if (!params.user.email) {
        return false;
      }
      console.log("mail is there",);

      try {
        await prisma.user.create({
          data: {
            email: params.user.email,
            provider: "Google",
          },
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // console.log(e);
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
