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
      if (!params.user || !params.user.email) {
        console.error("Missing user email in sign-in payload.");
        return false;
      }
      console.log("mail is there",);

      try {
        await prisma.user.upsert({
          where: { email: params.user.email },
          update: {}, // Update nothing if user exists
          create: {
            email: params.user.email,
            provider: "Google",
          },
        });
      } catch (e) {
        console.error("Error creating user in database:", e);
      }
      return true;
    },
  },
  // pages: {
  //   signIn: '/auth/signin'
    
  // }
});


export { handler as GET, handler as POST };
