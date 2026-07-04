"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui/Table";
import { Input } from "@/shared/ui/Input";
import { cn } from "@/shared/utils/cn";
import { X, CalendarPlus, Search, Filter, UploadCloud, Plane, Activity, CheckCircle, Clock, Check, XCircle } from "lucide-react";

export default function LeavePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDuration = () => {
    if (!startDate || !endDate) return "-- Days";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return "0 Days (Invalid Range)";
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} ${diffDays === 1 ? "Day" : "Days"}`;
  };

  const mockLeaves = [
    { id: 1, type: "Paid Leave", start: "15 Dec 2023", end: "20 Dec 2023", duration: "5 Days", status: "pending", color: "bg-blue-500" },
    { id: 2, type: "Sick Leave", start: "02 Nov 2023", end: "03 Nov 2023", duration: "2 Days", status: "approved", color: "bg-emerald-500" },
    { id: 3, type: "Unpaid Leave", start: "10 Oct 2023", end: "10 Oct 2023", duration: "1 Day", status: "rejected", color: "bg-rose-500" },
    { id: 4, type: "Paid Leave", start: "15 Aug 2023", end: "22 Aug 2023", duration: "6 Days", status: "approved", color: "bg-blue-500" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading text-primary">Leave History</h1>
          <p className="text-text-muted mt-1">View and manage your time off requests.</p>
        </div>
        <Button onClick={() => setIsDrawerOpen(true)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
          <CalendarPlus className="w-4 h-4" />
          Request Leave
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Annual Allowance */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Annual Allowance</h3>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-bold font-heading text-primary">24</span>
            <span className="text-sm font-medium text-text-muted mb-1">Days</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[100%]"></div>
          </div>
        </div>

        {/* Used */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Used</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-bold font-heading text-primary">10</span>
            <span className="text-sm font-medium text-text-muted mb-1">Days</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[41.6%]"></div>
          </div>
        </div>

        {/* Available */}
        <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Available</h3>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-bold font-heading text-primary">14</span>
            <span className="text-sm font-medium text-text-muted mb-1">Days</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 w-[58.3%]"></div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-xl shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leave history..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-text-muted">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-text-muted">Date Range</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-text-muted">Duration</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-text-muted">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-text-muted text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLeaves.map((leave) => (
              <TableRow key={leave.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", leave.color)}></div>
                    {leave.type}
                  </div>
                </TableCell>
                <TableCell>{leave.start} - {leave.end}</TableCell>
                <TableCell>{leave.duration}</TableCell>
                <TableCell>
                  {leave.status === "approved" && (
                    <Badge variant="success" className="bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit px-2.5 py-0.5">
                      <Check className="w-3 h-3" /> APPROVED
                    </Badge>
                  )}
                  {leave.status === "rejected" && (
                    <Badge variant="danger" className="bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit px-2.5 py-0.5">
                      <XCircle className="w-3 h-3" /> REJECTED
                    </Badge>
                  )}
                  {leave.status === "pending" && (
                    <Badge variant="warning" className="bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1 w-fit px-2.5 py-0.5">
                      <Clock className="w-3 h-3" /> PENDING
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right pr-6">
                  {leave.status === "pending" ? (
                    <button className="text-text-muted hover:text-text-main">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  ) : (
                    <span className="text-slate-300">--</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between text-sm">
          <span className="text-text-muted">Showing 1 to 4 of 24 entries</span>
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button className="w-7 h-7 rounded bg-slate-900 text-white font-medium flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center">2</button>
            <button className="w-7 h-7 rounded hover:bg-slate-100 text-slate-600 font-medium flex items-center justify-center">3</button>
            <button className="p-1 rounded hover:bg-slate-100 text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-[480px] bg-surface h-full shadow-2xl flex flex-col border-l border-surface-border animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-surface-border bg-white">
              <div>
                <h2 className="text-xl font-bold text-primary font-heading">Request Leave</h2>
                <p className="text-sm text-text-muted mt-1">Submit a new time-off request.</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-text-muted hover:text-text-main p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase">Leave Type</label>
                <select className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-text-main outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent text-sm">
                  <option value="">Select type...</option>
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-main">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-text-main outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-main">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-text-main outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-text-main">Estimated Duration:</span>
                <span className="text-sm font-bold text-primary font-heading">{getDuration()}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase">Remarks (Optional)</label>
                <textarea 
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-text-main outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none text-sm"
                  placeholder="Add any details about your request..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-2 tracking-wide uppercase">Attachments</label>
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-primary">Click to upload</p>
                  <p className="text-xs text-text-muted mt-1">PDF, JPG, JPEG, PNG, DOCX up to 10MB</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" />
              </div>
            </div>
            
            <div className="p-6 border-t border-surface-border bg-white flex items-center justify-between">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsDrawerOpen(false)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200">Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
