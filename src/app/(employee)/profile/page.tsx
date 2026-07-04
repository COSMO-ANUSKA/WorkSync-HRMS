"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Badge } from "@/shared/ui/Badge";
import { UploadCloud, FileText, Image as ImageIcon, Lock } from "lucide-react";

export default function ProfilePage() {
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileImage(url);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold font-heading text-primary">Profile Manager</h1>
        <p className="text-text-muted mt-1">Manage your personal information and associated documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Picture Block */}
          <div className="bg-surface border border-surface-border rounded-xl p-8 flex flex-col items-center shadow-sm">
            <div 
              className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 cursor-pointer overflow-hidden relative group mb-6"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-text-muted group-hover:text-primary transition-colors">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span className="text-xs text-center px-2">Upload Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium">Change</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload}
            />
            
            <div className="w-full text-center space-y-3">
              <h2 className="text-2xl font-bold font-heading text-primary text-center w-full px-2 py-1">
                Eleanor Vance
              </h2>
              <Badge variant="info" className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-sm font-medium">
                Senior UX Researcher
              </Badge>
            </div>
          </div>

          {/* Documents Block */}
          <div className="bg-surface border border-surface-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold font-heading text-primary">Documents</h2>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 mb-6 hover:bg-slate-100 transition-colors cursor-pointer">
              <UploadCloud className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-sm font-medium text-primary">Click to upload or drag and drop</p>
              <p className="text-xs text-text-muted mt-1">PDF, JPG, JPEG, PNG, DOCX (max. 10MB)</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider pb-2 border-b border-slate-100">
                <span>File Name</span>
                <span>Date</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-primary font-medium">Resume_2024.pdf</span>
                </div>
                <span className="text-xs text-text-muted text-right">Oct 12,<br/>2023</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-primary font-medium">ID_Proof.jpg</span>
                </div>
                <span className="text-xs text-text-muted text-right">Sep 05,<br/>2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8">
          <div className="bg-surface border border-surface-border rounded-xl p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-lg font-bold font-heading text-primary">Employee Information</h2>
              <p className="text-sm text-text-muted mt-1">Review and update your contact details. Core information is managed by HR.</p>
            </div>

            <div className="space-y-8">
              {/* Core Identity */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Core Identity (Read-Only)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-text-main">Full Name</label>
                    <div className="relative">
                      <input type="text" value={profileName || "Eleanor Vance"} disabled className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed" />
                      <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-text-main">Employee Code</label>
                    <div className="relative">
                      <input type="text" value="EMP-8472-A" disabled className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed" />
                      <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-text-main">Primary Role</label>
                    <div className="relative">
                      <input type="text" value="Senior UX Researcher" disabled className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed" />
                      <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-text-main">Date of Joining</label>
                    <div className="relative">
                      <input type="text" value="March 15, 2021" disabled className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed" />
                      <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-text-main">Mobile Phone</label>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-slate-400"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                      <input type="text" defaultValue="+1 (555) 123-4567" className="w-full pl-10 pr-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text-main text-sm outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent" />
                    </div>
                  </div>
                  <div className="space-y-1.5 relative">
                    <label className="text-sm font-medium text-text-main">Work Email</label>
                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-3 text-slate-400"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="m2 4 10 8 10-8"/></svg>
                      <input type="text" defaultValue="eleanor.v@worksync.com" className="w-full pl-10 pr-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text-main text-sm outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Residential Address</h3>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <textarea 
                    className="w-full pl-10 pr-3 py-2.5 bg-surface border border-surface-border rounded-lg text-text-main text-sm outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none"
                    rows={3}
                    defaultValue="1248 Horizon Boulevard, Apt 4B,&#10;San Francisco, CA 94110&#10;United States"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700">Reset</Button>
                <Button className="bg-slate-900 text-white hover:bg-slate-800">
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Changes
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
