"use client";

import Link from "next/link";
import Image from "next/image";
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
  AlertCircle,
} from "lucide-react";
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
  { label: "Security Alerts", href: "/security-alerts", icon: AlertCircle },
];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();

  const allowedRoutes =
    user?.role && roleAccess[user.role] ? roleAccess[user.role] : [];

  const handleNavClick = () => {
    if (isMobile && openMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        {/* Logo */}
        <div className="flex items-center justify-center px-4 py-4">
          <div
            className={cn(
              "relative transition-all duration-300",
              state === "collapsed" ? "h-12 w-12" : "h-14 w-44"
            )}
          >
            <Image
              src={
                state === "collapsed"
                  ? "/assets/logo-small.png"
                  : "/assets/logo.webp"
              }
              alt="VSource Education"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(
                  (item) =>
                    allowedRoutes.includes("*") ||
                    allowedRoutes.includes(item.href)
                )
                .map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        onClick={handleNavClick}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex w-full items-center gap-3 cursor-pointer",
                            isActive && "font-semibold"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-3 text-[11px] text-muted-foreground">
        {state !== "collapsed"
          ? `© ${new Date().getFullYear()} VSource Education`
          : `© ${new Date().getFullYear()}`}
      </SidebarFooter>
    </Sidebar>
  );
}
