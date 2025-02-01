import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(req) {
  const { pathname, searchParams } = req.nextUrl;

  // Match locale in the pathname (vi or en)
  const localeMatch = pathname.match(/^\/(vi|en)(\/.*)?/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  console.log('Locale:', locale); // Debugging line

  const authRoutes = ["/sign-in", "/sign-up", "/forgot-password"].map(
    (route) => `/${locale}${route}`
  );

  const publicRoutes = [
    ...authRoutes,
    "/api/",
    "/_next/",
    "/favicon.ico",
    "/assets/",
  ];

  // Check if the request is for a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthenticated = req.cookies.get("authToken");

  // If not authenticated and accessing a protected route, redirect to sign-in
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL(`/${locale}/sign-in`, req.url);
    signInUrl.search = searchParams.toString();
    return NextResponse.redirect(signInUrl);
  }

  // If the request path does not contain a locale (like /contacts), add the default locale
  if (!localeMatch && !isPublicRoute) {
    const redirectUrl = new URL(`/${locale}${pathname}`, req.url);
    redirectUrl.search = searchParams.toString();
    return NextResponse.redirect(redirectUrl);
  }

  // Handle the request through intlMiddleware
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/", "/(vi|en)/:path*"],
};
