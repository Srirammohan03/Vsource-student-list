"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import {
  LayoutDashboard,
  UserPlus,
  ListChecks,
  CreditCard,
  FileText,
  Users
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Student Registration",
    href: "/student-registration",
    icon: UserPlus
  },
  {
    label: "Student Registration List",
    href: "/student-registration-list",
    icon: ListChecks
  },
  { label: "Sub Admin Form", href: "/sub-admin", icon: Users },
  { label: "Make Payment", href: "/make-payment", icon: CreditCard },
  {
    label: "Transactions List",
    href: "/transactions",
    icon: FileText
  },
  { label: "Employee Logins", href: "/employee-logins", icon: Users }
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ collapsed, mobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-200",
        mobile
          ? // Mobile panel (inside overlay)
            "h-full w-full bg-slate-50"
          : // Desktop sidebar
          collapsed
          ? "hidden h-screen w-16 border-r border-slate-200 bg-white/95 shadow-sm lg:flex"
          : "hidden h-screen w-64 border-r border-slate-200 bg-white/95 shadow-sm lg:flex"
      )}
    >
      {/* Header with logo */}
      <div
        className={cn(
          "flex items-center px-4 py-4",
          !mobile && collapsed && "justify-center"
        )}
      >
        <Logo compact={!mobile && collapsed} />
      </div>

      {/* Navigation items */}
      <nav className="mt-2 flex-1 space-y-1 px-2 text-sm">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-slate-700 hover:bg-slate-100",
                active && "bg-primary/10 text-primary font-semibold"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-400">
        © {new Date().getFullYear()} VSource Education
      </div>
    </aside>
  );
}
