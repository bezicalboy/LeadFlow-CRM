import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router";
import { LOGIN_PATH } from "@/const";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-[#D4FF00] flex items-center justify-center animate-pulse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#000"/>
            </svg>
          </div>
          <span className="text-[#52525B] text-sm">Loading LeadFlow...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <Sidebar />
      <div className="ml-[240px] min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
