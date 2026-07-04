"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="flex flex-1 flex-col w-full max-w-7xl mx-auto">
      <header className="w-full flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-1 text-primary">
          <Image src="/logo.svg" alt="Payze" width={20} height={30} />
          <span className="text-xl font-semibold tracking-tight">payze</span>
        </Link>
        <Link
          href={isLogin ? "/register" : "/login"}
          className="group relative text-sm flex items-center gap-2 font-medium text-muted-foreground hover:text-primary transition-colors pb-1"
        >
          {isLogin ? "Create Account" : "Log in"}
          <ArrowUpRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gray-200" />
          <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
