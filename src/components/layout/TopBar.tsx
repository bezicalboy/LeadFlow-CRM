import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Plus, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-[#27272A] flex items-center justify-between px-6">
      {/* Left: Breadcrumb area */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-widest text-[#52525B]">
          CRM Dashboard
        </span>
      </div>

      {/* Center: Search */}
      <div
        className={`relative flex items-center bg-[#121212] border rounded-lg transition-all duration-200 ${
          searchFocused ? "border-[#D4FF00] w-96" : "border-[#27272A] w-72"
        }`}
      >
        <Search size={16} className="absolute left-3 text-[#52525B]" />
        <input
          type="text"
          placeholder="Search leads, contacts..."
          className="w-full bg-transparent text-sm text-white placeholder-[#52525B] pl-9 pr-4 py-2 outline-none"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate(`/leads?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
            }
          }}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/leads/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#D4FF00] text-black text-sm font-medium rounded-full hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] transition-all"
        >
          <Plus size={16} />
          Add Lead
        </Link>

        <button className="relative p-2 text-[#52525B] hover:text-[#A1A1AA] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4FF00] rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-[#27272A]">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <User size={16} className="text-[#52525B]" />
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{user?.name || "User"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
