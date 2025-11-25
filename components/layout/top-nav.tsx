"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Sidebar as SidebarInner } from "./sidebar";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface TopNavProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm">
      {/* Mobile Sidebar Trigger */}
      <div className="flex items-center lg:hidden">
        <Sheet>
          <SheetTrigger className="flex items-center">
            <Menu className="h-6 w-6 text-slate-700" />
          </SheetTrigger>

          {/* FIXED SHEET CONTENT */}
          <SheetContent side="left">
            <div className="w-[85vw] max-w-xs h-full bg-white shadow-xl overflow-y-auto p-0">
              <SidebarInner
                collapsed={false}
                onToggle={() => {}}
                mobile={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar Toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="hidden lg:flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Right: Avatar + Dropdown */}
      <div className="ml-auto flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer">
            <Avatar className="bg-primary text-white flex items-center justify-center">
              {user?.name?.charAt(0) || "A"}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-44">
            <DropdownMenuItem>{user?.name}</DropdownMenuItem>
            <DropdownMenuItem>{user?.role}</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
