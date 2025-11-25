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
  Users,
  ChevronLeft,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Student Registration",
    href: "/dashboard/student-registration",
    icon: UserPlus,
  },
  {
    label: "Student Registration List",
    href: "/dashboard/student-registration-list",
    icon: ListChecks,
  },
  { label: "Sub Admin Form", href: "/dashboard/sub-admin", icon: Users },
  { label: "Make Payment", href: "/dashboard/make-payment", icon: CreditCard },
  {
    label: "Transactions List",
    href: "/dashboard/transactions",
    icon: FileText,
  },
  { label: "Employee Logins", href: "/dashboard/employee-logins", icon: Users },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean; // ⭐ Added
}

export function Sidebar({ collapsed, onToggle, mobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen border-r border-slate-200 bg-white/95 shadow-sm flex flex-col transition-all duration-200",
        mobile
          ? "w-full"
          : collapsed
          ? "w-16 hidden lg:flex"
          : "w-64 hidden lg:flex"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && !mobile && <Logo />}

        {/* Only show collapse button on desktop */}
        {!mobile && (
          <button
            type="button"
            onClick={onToggle}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Navigation */}
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
