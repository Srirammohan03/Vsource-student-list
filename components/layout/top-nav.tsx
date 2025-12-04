"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AppSidebar as SidebarInner } from "./sidebar";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";

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
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
        <SidebarTrigger>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>

        {/* Right: Avatar + Dropdown */}
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 bg-primary">
                  {/* User Image (optional) */}

                  <AvatarFallback className="bg-primary text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "N/A"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "N/A"}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuItem
                className="text-destructive"
                onClick={handleLogout}
              >
                Log out
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
                <SidebarInner />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
