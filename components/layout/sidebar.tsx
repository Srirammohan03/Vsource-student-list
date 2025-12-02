"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  UserPlus,
  ListChecks,
  CreditCard,
  FileText,
  Users,
  Footprints,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { roleAccess } from "@/utils/roleAccess";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Student Registration",
    href: "/student-registration",
    icon: UserPlus,
  },
  {
    label: "Student Registration List",
    href: "/student-registration-list",
    icon: ListChecks,
  },
  { label: "Make Payment", href: "/make-payment", icon: CreditCard },
  { label: "Transactions List", href: "/transactions", icon: FileText },
  { label: "Sub Admin Form", href: "/sub-admin", icon: Users },
  { label: "Employee Logins", href: "/employee-logins", icon: Users },
  { label: "Audit Logs", href: "/audit-log", icon: Footprints },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const allowedRoutes =
    user?.role && roleAccess[user.role] ? roleAccess[user.role] : [];
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo Section */}

        <div className="flex items-center px-4 py-4">
          {state !== "collapsed" ? (
            <div className="relative h-10 w-60">
              <Image
                src="/assets/logo.webp"
                alt="VSource Education"
                width={80}
                height={80}
                className="object-cover rounded-sm"
                priority
              />
            </div>
          ) : (
            <div className="relative h-10 w-60">
              <Image
                src="/assets/logo-small.png"
                alt="VSource Education"
                height={80}
                width={80}
                className="object-cover rounded-sm "
                priority
              />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                ?.filter(
                  (item) =>
                    allowedRoutes.includes("*") ||
                    allowedRoutes.includes(item.href)
                )
                ?.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent",
                            active && "bg-primary/10 text-primary font-semibold"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500">
        {state !== "collapsed"
          ? `© ${new Date().getFullYear()} VSource Education`
          : `© ${new Date().getFullYear()}`}
      </SidebarFooter>
    </Sidebar>
  );
}
