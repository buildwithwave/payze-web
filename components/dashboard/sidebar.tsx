"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Analytics02Icon,
  Store01Icon,
  Package01Icon,
  Invoice01Icon,
  CreditCardIcon,
  Settings01Icon,
  Logout01Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Dashboard", href: "/dashboard", icon: Home01Icon },
  { label: "Analytics", href: "/dashboard/analytics", icon: Analytics02Icon },
  { label: "Stores", href: "/dashboard/stores", icon: Store01Icon },
  { label: "Products", href: "/dashboard/products", icon: Package01Icon },
  { label: "Invoices", href: "/dashboard/invoices", icon: Invoice01Icon },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCardIcon },
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
        "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] font-medium transition-all",
        active
          ? "bg-primary text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-black/5"
      )}
    >
      <HugeiconsIcon
        icon={icon}
        size={18}
        strokeWidth={active ? 2.5 : 1.5}
      />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col justify-between w-[18%] min-w-50 h-screen py-6 px-3">
      {/* Top */}
      <div>
      <div className="px-3 mb-4">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <Image src="/logo.svg" alt="Payzee" width={26} height={28} />
          <span className="text-2xl font-semibold text-primary tracking-tight">Payzee</span>
        </Link>
      </div>

      {/* Business Switcher */}
      <button className="flex items-center gap-2  mb-4 mx-1 px-3 w-full  py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left cursor-pointer">
        <div className="flex items-center justify-center size-5 rounded bg-black text-primary text-sm font-semibold shrink-0">
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate">Onigbinde Stores</p>
        </div>
        <HugeiconsIcon icon={UnfoldMoreIcon} size={16} className="text-muted-foreground shrink-0" />
      </button>

      {/* Main Nav */}
      <nav className="flex flex-col gap-0.5 px-1 mt-6">
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
