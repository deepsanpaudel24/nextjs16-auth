import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// Define routes
const PUBLIC_ROUTES = ["/", "/about"];
const GUEST_ROUTES = ["/auth/login", "/auth/register"];
const PROTECTED_PREFIXES = ["/profile", "/settings"];

export default auth((req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 1️⃣ Public routes → allow always
  if (PUBLIC_ROUTES.includes(pathname)) {
    return;
  }

  // 2️⃣ Guest routes
  if (GUEST_ROUTES.includes(pathname)) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", req.url));
    }
    return;
  }

  // 3️⃣ Protected routes
  const isProtectedRoute = PROTECTED_PREFIXES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", req.url));
  }
});
