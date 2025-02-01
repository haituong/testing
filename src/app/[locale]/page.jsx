"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
export default function HomePage() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "en";
  useEffect(() => {
    router.push(`${currentLocale}/contacts`);
  }, []);
  return <div></div>;
}
