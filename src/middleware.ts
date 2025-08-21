import { auth } from "@/lib/auth";

export default auth((req) => {
  // Only protect /game routes
  if (req.nextUrl.pathname.startsWith("/game")) {
    if (!req.auth) {
      return Response.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/game/:path*"],
};
