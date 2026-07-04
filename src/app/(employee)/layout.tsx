import React from "react";
import Link from "next/link";
import { LayoutDashboard, Calendar, CalendarOff, Bell, User } from "lucide-react";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] h-full bg-surface/80 backdrop-blur-md border-r border-surface-border">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          </div>
          <span className="text-lg font-bold font-heading text-primary tracking-tight">WorkSync</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary bg-emerald-50/50 hover:bg-emerald-50 transition-colors font-medium">
            <LayoutDashboard className="w-5 h-5 text-accent-emerald" />
            Dashboard
          </Link>
          <Link href="/attendance" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-slate-50 transition-colors font-medium">
            <Calendar className="w-5 h-5" />
            Attendance
          </Link>
          <Link href="/leave" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-slate-50 transition-colors font-medium">
            <CalendarOff className="w-5 h-5" />
            Leave Requests
          </Link>
        </nav>
        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-main">John Doe</span>
              <span className="text-xs text-text-muted">Employee</span>
            </div>
          </div>
          <button className="w-full text-left px-3 py-2 text-sm text-text-muted hover:bg-slate-50 rounded-lg transition-colors">
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
        <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-accent-emerald">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/attendance" className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-text-muted">
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium">Attend</span>
        </Link>
        <Link href="/leave" className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-text-muted">
          <CalendarOff className="w-5 h-5" />
          <span className="text-[10px] font-medium">Leave</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-text-muted relative">
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium">Alerts</span>
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-accent-rose" />
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center gap-1 w-14 h-12 text-text-muted">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
