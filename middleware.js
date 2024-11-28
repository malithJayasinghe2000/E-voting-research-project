import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req){
    console.log(req.nextUrl.pathname);
    console.log(req.nextauth.token.role);

    if(req.nextUrl.pathname.startsWith("/CreateUser/page") && req.nextauth.token.role != "admin"){
        return NextResponse.rewrite(new URL("/Denied/page", req.url));
    }

    if(req.nextUrl.pathname.startsWith("/CreateGSW/page") && req.nextauth.token.role != "plk"){
        return NextResponse.rewrite(new URL("/Denied/page", req.url));
    }
},
{
    callbacks: {
        authorized: ({token}) => !!token,
    },
}

);

export const config = { matcher: ["/CreateUser/page","/CreateGSW/page"] };