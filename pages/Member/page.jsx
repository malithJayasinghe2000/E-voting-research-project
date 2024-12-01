"use client";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";


const Member = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      signIn({ callbackUrl: "/Member/page" });
    
    }
  });

  if (!session) {
    return null;
  }

  

  return (
    <div>
      <h1>Member</h1>
      <p>Welcome : {session?.user?.email}</p>
      <p>Role : {session?.user?.role}</p>
      <p>Id : {session?.user?._id}</p>
    </div>
  );
};

export default Member;
