"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui/Table";
import { Input } from "@/shared/ui/Input";
import { cn } from "@/shared/utils/cn";
import { X, CalendarPlus } from "lucide-react";

export default function LeavePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [remarks, setRemarks] = useState("");

  const mockLeaves = [
    { id: 1, type: "Paid", start: "12 Jul 2026", end: "14 Jul 2026", duration: "3 Days", status: "approved" },
    { id: 2, type: "Sick", start: "20 Jun 2026", end: "20 Jun 2026", duration: "1 Day", status: "rejected" },
    { id: 3, type: "Paid", start: "01 Aug 2026", end: "05 Aug 2026", duration: "5 Days", status: "pending" },
  ];

  return (
    <div className="space-y-6 overflow-hidden relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-primary">Leave Requests</h1>
        <Button onClick={() => setIsDrawerOpen(true)} className="gap-2">
          <CalendarPlus className="w-4 h-4" />
          Request Leave
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockLeaves.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell className="font-medium">{leave.type}</TableCell>
              <TableCell>{leave.start}</TableCell>
              <TableCell>{leave.end}</TableCell>
              <TableCell>{leave.duration}</TableCell>
              <TableCell>
                {leave.status === "approved" && <Badge variant="success">Approved</Badge>}
                {leave.status === "rejected" && <Badge variant="danger">Rejected</Badge>}
                {leave.status === "pending" && <Badge variant="warning">Pending</Badge>}
              </TableCell>
              <TableCell>
                {leave.status === "pending" ? (
                  <button className="text-accent-rose text-sm font-semibold hover:underline">Cancel</button>
                ) : (
                  <span className="text-text-muted text-sm">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Sliding Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-[420px] bg-surface h-full shadow-2xl flex flex-col border-l border-surface-border animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-surface-border bg-slate-50/50">
              <h2 className="text-xl font-bold text-primary font-heading">New Leave Request</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-text-muted hover:text-text-main p-1 rounded hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase">Leave Type</label>
                <select className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface text-text-main outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent">
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Start Date" />
                <Input type="date" label="End Date" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase">Remarks</label>
                <textarea 
                  rows={4}
                  maxLength={250}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-surface-border bg-surface text-text-main outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none"
                  placeholder="Reason for leave..."
                />
                <div className="flex justify-end mt-1">
                  <span className={cn("text-xs font-medium", remarks.length === 250 ? "text-accent-rose" : "text-text-muted")}>
                    {remarks.length}/250
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-surface-border bg-slate-50/50 flex items-center justify-between">
              <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDrawerOpen(false)}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
