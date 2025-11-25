"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Sidebar as SidebarInner } from "./sidebar";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface TopNavProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean; // kept for compatibility, even if not used
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/auth/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm">
        {/* Mobile: Sidebar Trigger */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop: Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 lg:flex"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Right: Avatar + Dropdown */}
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="flex items-center justify-center bg-primary text-white">
                {user?.name?.charAt(0) || "A"}
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-44">
              <DropdownMenuItem>{user?.name}</DropdownMenuItem>
              <DropdownMenuItem>{user?.role}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute inset-y-0 left-0 flex w-[80vw] max-w-xs transform bg-slate-50 shadow-xl transition-transform">
            <div className="flex h-full w-full flex-col">
              {/* Panel header with close icon */}
              <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-red-600 px-4 text-sm font-semibold text-white">
                <span>Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sidebar content (mobile mode) */}
              <div className="flex-1 overflow-y-auto">
                <SidebarInner
                  collapsed={false}
                  onToggle={() => {}}
                  mobile={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
