import React from "react";
import { Button } from "@/shared/ui/Button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold font-heading text-primary">Welcome, John Doe</h1>
        <p className="text-sm text-text-muted mt-1">Saturday, July 4, 2026 • 11:45 AM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Check-In Widget */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center">
          <div className="text-3xl font-mono font-medium text-primary mb-6">02:33:14</div>
          <Button variant="danger" className="w-40 h-40 rounded-full shadow-lg hover:scale-105 transition-transform text-xl mb-4">
            Check Out
          </Button>
          <div className="flex items-center gap-2 text-sm font-medium text-accent-emerald">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-emerald"></span>
            </span>
            Checked in at 09:12 AM
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-text-muted mb-4">Today's Status</h2>
          <div className="text-4xl font-bold text-primary mb-2">2h 33m</div>
          <p className="text-sm text-text-muted">Total logged hours today</p>
        </div>

        {/* Leave Days */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-text-muted mb-4">Leave Days Taken</h2>
          <div className="text-4xl font-bold text-primary mb-2">4 Days</div>
          <p className="text-sm text-text-muted">Approved leaves this year</p>
        </div>
      </div>
    </div>
  );
}
