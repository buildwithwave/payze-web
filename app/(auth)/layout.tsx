import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col w-full max-w-7xl mx-auto">
      <header className="w-full flex items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-1">
          <Image src="/logo.svg" alt="Payzee" width={20} height={30} />
          <span className="text-xl font-medium tracking-tight">Payzee</span>
        </Link>
        <Link
          href="/register"
          className="group text-base flex items-center gap-2 font-medium text-foreground hover:text-foreground/80 transition-all"
        >
          Create account
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
