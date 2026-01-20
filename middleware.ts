import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    // Protect all routes except login, api, and next static files
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - login (login page)
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!login|api|_next/static|_next/image|favicon.ico).*)",
    ],
};
