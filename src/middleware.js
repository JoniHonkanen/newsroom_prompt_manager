import { NextResponse } from "next/server";

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || "admin";
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD;

export function middleware(request) {
  console.log("Middleware triggered for:", request.url);
  console.log("Password set:", !!BASIC_AUTH_PASSWORD);
  
  if (!BASIC_AUTH_PASSWORD) {
    console.log("No password set, skipping auth");
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  
  if (authHeader) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    if (username === BASIC_AUTH_USER && password === BASIC_AUTH_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|serviceWorker).*)',
};