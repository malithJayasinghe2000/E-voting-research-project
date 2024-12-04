import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "../../../(models)/User";
import bcrypt from "bcryptjs";
import connectDB from "../../../(models)/db";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile) {
        console.log("profile github", profile);
        console.log("email", profile.email);

        let userRole = "Github User";
        if (profile?.email === "shabry@knightowl.online") {
          userRole = "admin";
          console.log("admin");
        }
        return {
          ...profile,
          role: userRole,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      profile(profile) {
        console.log("profile google", profile);
       

        let userRole = "Google User";
        return {
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { 
          label: "email", 
          type: "email",
          placeholder: "your-email"
        },
        password:{
          label: "password",
          type: "password",
          placeholder: "your-password"
        }
      },
      async authorize(credentials){
        try{
          await connectDB();
          const foundUser = await User.findOne({email: credentials.email})
          .lean()
          .exec();

          if (foundUser) {
            console.log("user exists");
            const match = await bcrypt.compare(credentials.password, foundUser.password);

            if (match) {
              console.log("good pass");
              delete foundUser.password;

              if(credentials.role === "plk"){
                foundUser["role"] = "plk";

              }
              if(credentials.role === "gsw"){
                foundUser["role"] = "gsw";
              }
              if(credentials.role === "polling_manager"){
                foundUser["role"] = "polling_manager";
              }

              return foundUser;


            }
          }
        }catch(error){
          console.log(error);
        }
        return null;
        }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
   
  },
  secret: process.env.NEXTAUTH_SECRET,
  
};

// Export the default handler for NextAuth
export default NextAuth(authOptions);
