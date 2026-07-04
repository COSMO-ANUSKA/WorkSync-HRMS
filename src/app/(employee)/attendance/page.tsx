"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

// Mock data to demonstrate the UI
const mockAttendance = {
  "2026-07-01": { status: "present", checkIn: "09:00:00", checkOut: "17:00:00" },
  "2026-07-02": { status: "present", checkIn: "09:15:00", checkOut: "17:30:00" },
  "2026-07-03": { status: "absent", checkIn: "N/A", checkOut: "N/A" },
  "2026-07-04": { status: "present", checkIn: "09:12:00", checkOut: "N/A" }, // Today
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 4)); // July 4, 2026

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: 35 }, (_, i) => {
    const dayNumber = i - firstDay + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
      return {
        dayNumber,
        dateString,
        data: mockAttendance[dateString as keyof typeof mockAttendance]
      };
    }
    return null;
  });

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-primary">Attendance Calendar</h1>
        
        <div className="flex items-center gap-4 bg-surface border border-surface-border rounded-lg p-2 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded text-text-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-primary w-32 text-center">
            {currentDate.toLocaleString('default', { month: 'long' })} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded text-text-muted transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-surface-border bg-slate-50/50">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-text-muted uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "min-h-[100px] p-2 border-r border-b border-surface-border relative group",
                !day && "bg-slate-50/30",
                day && "hover:bg-slate-50 transition-colors"
              )}
            >
              {day && (
                <>
                  <span className="absolute top-2 right-2 text-sm font-medium text-text-muted">
                    {day.dayNumber}
                  </span>
                  
                  {day.data && (
                    <div className="absolute bottom-2 left-2 flex items-center justify-center">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        day.data.status === 'present' && "bg-accent-emerald",
                        day.data.status === 'absent' && "bg-accent-rose",
                        day.data.status === 'leave' && "bg-accent-amber"
                      )} />
                    </div>
                  )}

                  {/* Tooltip */}
                  {day.data && (
                    <div className="absolute hidden group-hover:block z-50 bg-primary text-white p-3 rounded shadow-md text-xs bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 pointer-events-none">
                      <div className="font-semibold mb-1 capitalize border-b border-white/20 pb-1">{day.data.status}</div>
                      <div className="flex justify-between mt-1 text-white/80">
                        <span>In:</span> <span>{day.data.checkIn}</span>
                      </div>
                      <div className="flex justify-between mt-1 text-white/80">
                        <span>Out:</span> <span>{day.data.checkOut}</span>
                      </div>
                      <div className="absolute w-2 h-2 bg-primary rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
