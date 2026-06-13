import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: KanbanSquare, label: "Pipeline", path: "/pipeline" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-[#050505] border-r border-[#27272A] z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#27272A] min-h-[64px]">
        <div className="w-8 h-8 rounded-lg bg-[#D4FF00] flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#000"/>
          </svg>
        </div>
        {!collapsed && (
          <span className="text-white font-semibold text-lg tracking-tight whitespace-nowrap">
            LeadFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-[#1A1A1A] text-[#D4FF00]"
                  : "text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#121212]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                size={20}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  isActive ? "text-[#D4FF00]" : "text-[#52525B] group-hover:text-[#A1A1AA]"
                )}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#121212] transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight size={20} className="flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#52525B] hover:text-red-400 hover:bg-red-400/10 transition-all w-full"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
