"use client";

import React, { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, Hourglass, CalendarCheck, Wallet, ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [, setTick] = useState<number>(0);

  // Initialize and update clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load initial check-in state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCheckedIn = localStorage.getItem("worksync_checked_in") === "true";
      const savedCheckInTime = localStorage.getItem("worksync_check_in_time");
      
      setIsCheckedIn(savedCheckedIn);
      if (savedCheckInTime) {
        setCheckInTime(new Date(savedCheckInTime));
      }
    }
  }, []);

  // Force re-render every second when checked in to update the duration timer
  useEffect(() => {
    if (!isCheckedIn) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Calculate live duration in seconds
  const getDurationSeconds = () => {
    if (!isCheckedIn || !checkInTime) return 0;
    const diff = Math.floor((new Date().getTime() - checkInTime.getTime()) / 1000);
    return Math.max(0, diff);
  };

  // Format seconds to Xh Ym
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleCheckInToggle = () => {
    if (isCheckedIn) {
      // Check Out
      setIsCheckedIn(false);
      setCheckInTime(null);
      localStorage.removeItem("worksync_checked_in");
      localStorage.removeItem("worksync_check_in_time");
    } else {
      // Check In
      const now = new Date();
      setIsCheckedIn(true);
      setCheckInTime(now);
      localStorage.setItem("worksync_checked_in", "true");
      localStorage.setItem("worksync_check_in_time", now.toISOString());
    }
  };

  const durationSeconds = getDurationSeconds();
  const formattedDuration = formatDuration(durationSeconds);
  const targetSeconds = 8 * 3600; // 8 hours
  const percentage = Math.min(100, (durationSeconds / targetSeconds) * 100);

  const formattedCheckInTime = checkInTime
    ? checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section with Clock */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold font-heading text-primary tracking-tight">
            Welcome, John Doe
          </h1>
          <p className="text-sm text-text-muted mt-1">Here is your daily summary.</p>
        </div>

        {/* Real-time Clock Pill */}
        <div className="self-start md:self-auto inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#EBF1FA] text-primary shadow-sm">
          <Clock className="w-4 h-4 text-accent-blue" />
          <span className="text-sm font-semibold font-mono tracking-wider">
            {currentTime || "12:00:00 AM"}
          </span>
        </div>
      </div>

      {/* Main Grid: Time Tracking (Left) & Live status cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracking Widget */}
        <div className="bg-surface border border-surface-border rounded-2xl p-8 flex flex-col items-center justify-between text-center min-h-[420px] shadow-sm">
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-text-muted uppercase">
            Time Tracking
          </h2>

          <div className="my-auto flex flex-col items-center justify-center">
            <button
              onClick={handleCheckInToggle}
              className={cn(
                "w-44 h-44 rounded-full flex flex-col items-center justify-center gap-2.5 transition-all duration-300 hover:scale-105 cursor-pointer text-white",
                isCheckedIn
                  ? "bg-accent-rose hover:bg-rose-600 shadow-[0_10px_30px_-5px_rgba(244,63,94,0.4)]"
                  : "bg-accent-blue hover:bg-blue-600 shadow-[0_10px_30px_-5px_rgba(30,144,255,0.4)]"
              )}
            >
              {isCheckedIn ? (
                <>
                  <LogOut className="w-9 h-9" />
                  <span className="font-bold text-base tracking-wide">Check Out</span>
                </>
              ) : (
                <>
                  <LogIn className="w-9 h-9" />
                  <span className="font-bold text-base tracking-wide">Check In</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase mb-1.5">
              Current Status
            </span>
            {isCheckedIn ? (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-accent-emerald flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-emerald"></span>
                  </span>
                  Checked In
                </span>
                <span className="text-xs text-text-muted mt-1">
                  Checked in at {formattedCheckInTime}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold text-text-main">Checked Out</span>
                <span className="text-xs text-text-muted mt-1">--</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Status Cards & Compensation Summary Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Upper row: Duration & Leave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration Status Card */}
            <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[198px]">
              <span
                className={cn(
                  "absolute top-6 right-6 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border transition-all duration-300",
                  isCheckedIn
                    ? "bg-emerald-50 text-accent-emerald border-emerald-200"
                    : "bg-slate-50 text-text-muted border-slate-200"
                )}
              >
                {isCheckedIn ? "Active Today" : "Inactive"}
              </span>

              <div className="w-12 h-12 rounded-xl bg-blue-50 text-accent-blue flex items-center justify-center">
                <Hourglass className={cn("w-5 h-5", isCheckedIn && "animate-[spin_4s_linear_infinite]")} />
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                  Duration
                </span>
                <div className="text-3xl font-extrabold tracking-tight font-heading mt-1">
                  {formattedDuration}
                </div>
              </div>

              <div className="w-full mt-4">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="bg-accent-blue h-full rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex justify-end text-[10px] font-semibold text-text-muted mt-2">
                  Target: 8h
                </div>
              </div>
            </div>

            {/* Leave Card */}
            <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[198px]">
              <span className="absolute top-6 right-6 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border bg-slate-100 text-text-muted border-slate-200">
                2024 YTD
              </span>

              <div className="w-12 h-12 rounded-xl bg-rose-50 text-accent-rose flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>

              <div className="mt-4">
                <span className="text-[10px] font-bold tracking-wider text-text-muted uppercase">
                  Approved Leave
                </span>
                <div className="text-3xl font-extrabold tracking-tight font-heading mt-1">
                  4 Days
                </div>
              </div>

              <div className="flex gap-3 w-full mt-4">
                <button className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer text-center">
                  Request
                </button>
                <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-text-main text-xs font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer text-center">
                  History
                </button>
              </div>
            </div>
          </div>

          {/* Lower row: Compensation Summary Card */}
          <div className="bg-surface border border-surface-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent-blue flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-base text-primary font-heading">
                  Compensation Summary
                </h3>
              </div>
              <a
                href="/profile"
                className="text-accent-blue hover:text-blue-700 text-xs font-bold flex items-center gap-1.5 hover:underline"
              >
                View Full <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Base Salary
                </span>
                <span className="text-lg font-extrabold text-text-main font-heading mt-0.5">
                  $85,000 <span className="text-xs font-medium text-text-muted">/yr</span>
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Next Payout
                </span>
                <span className="text-lg font-extrabold text-text-main font-heading mt-0.5">
                  Oct 31
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100/50 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Tax Bracket
                </span>
                <span className="text-lg font-extrabold text-text-main font-heading mt-0.5">
                  Standard
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
