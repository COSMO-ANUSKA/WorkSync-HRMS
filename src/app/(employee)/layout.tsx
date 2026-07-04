"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, CalendarOff, User, Bell, LogOut, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/attendance", label: "Attendance", icon: Calendar },
    { href: "/leave", label: "Leave", icon: CalendarOff },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const mobileNavItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/attendance", label: "Attend", icon: Calendar },
    { href: "/leave", label: "Leave", icon: CalendarOff },
    { href: "/notifications", label: "Alerts", icon: Bell, hasBadge: true },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] h-full bg-surface/80 backdrop-blur-md border-r border-surface-border">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-accent-blue">
            <RefreshCw className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold font-heading text-primary tracking-tight leading-none">WorkSync</span>
            <span className="text-[10px] text-text-muted font-medium mt-1">HRMS Platform</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm",
                  isActive
                    ? "text-accent-blue bg-blue-50/70 hover:bg-blue-100/50"
                    : "text-text-muted hover:text-text-main hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-accent-blue" : "text-text-muted")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-border mt-auto">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-accent-rose font-medium hover:bg-rose-50 rounded-lg transition-colors cursor-pointer">
            <LogOut className="w-5 h-5 text-accent-rose" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-40">
          <span className="font-bold font-heading text-primary text-lg">WorkSync</span>
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </header>
        
        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-t border-surface-border flex items-center justify-around z-40 pb-safe">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-14 h-12 transition-colors relative",
                isActive ? "text-accent-blue" : "text-text-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.hasBadge && (
                <span className="absolute top-1.5 right-3.5 w-2 h-2 rounded-full bg-accent-rose" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
