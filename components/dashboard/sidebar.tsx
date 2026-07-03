"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Store01Icon,
  Package01Icon,
  Invoice01Icon,
  CreditCardIcon,
  Settings01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { StoreSwitcher } from "@/components/dashboard/store-switcher";

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: Home01Icon },
  { label: "Products", href: "/dashboard/products", icon: Package01Icon },
  { label: "Invoices", href: "/dashboard/invoices", icon: Invoice01Icon },
  { label: "Transactions", href: "/dashboard/payments", icon: CreditCardIcon },
  { label: "Stores", href: "/dashboard/stores", icon: Store01Icon },
];

const bottomNav = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings01Icon },
];

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Home01Icon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-6 gap-x-3 px-3 py-2 rounded-lg text-[15px] transition-all",
        active
          ? "bg-primary text-white font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-black/5",
      )}
    >
      <HugeiconsIcon icon={icon} size={18} strokeWidth={active ? 2.5 : 1.5} />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col justify-between w-80 h-screen py-6 px-3 overflow-hidden shrink-0">
      {/* Top */}
      <div>
        <div className="px-3 mb-4">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <Image src="/logo.svg" alt="Payzee" width={26} height={28} />
            <span className="text-[22px] font-medium text-primary tracking-tight">
              Payze
            </span>
          </Link>
        </div>

        <StoreSwitcher />

        {/* Main Nav */}
        <nav className="flex flex-col gap-1 px-1 mt-6">
          {mainNav.map(({ label, href, icon }) => (
            <NavItem
              key={href}
              href={href}
              icon={icon}
              label={label}
              active={pathname === href}
            />
          ))}
        </nav>
      </div>

      {/* Bottom Nav */}
      <div className="px-1 space-y-0.5">
        {bottomNav.map(({ label, href, icon }) => (
          <NavItem
            key={href}
            href={href}
            icon={icon}
            label={label}
            active={pathname === href}
          />
        ))}
        <button
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 transition-all w-full"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  );
}
