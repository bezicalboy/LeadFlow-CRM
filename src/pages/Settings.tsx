import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Palette,
  Bell,
  HelpCircle,
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  const sections = [
    {
      icon: User,
      title: "Profile",
      description: "Manage your account information",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#27272A]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center border-2 border-[#27272A]">
                <User size={28} className="text-[#52525B]" />
              </div>
            )}
            <div>
              <p className="text-lg font-medium text-white">{user?.name || "User"}</p>
              <p className="text-sm text-[#52525B]">{user?.email || "No email"}</p>
              <p className="text-xs text-[#3F3F46] mt-1 capitalize">
                Role: {user?.role || "user"}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Security",
      description: "Authentication and session management",
      content: (
        <div className="space-y-4">
          <div className="bg-[#121212] rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Email & Password</p>
                <p className="text-xs text-[#52525B] mt-1">
                  You are signed in with your LeadFlow account
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
                <span className="text-xs text-[#D4FF00]">Active</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Sign Out
          </Button>
        </div>
      ),
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize the look and feel",
      content: (
        <div className="space-y-4">
          <div className="bg-[#121212] rounded-lg p-4">
            <p className="text-sm font-medium text-white">Dark Mode</p>
            <p className="text-xs text-[#52525B] mt-1">
              LeadFlow uses a premium dark theme optimized for extended use
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#050505] border border-[#27272A]" />
              <div className="w-8 h-8 rounded-lg bg-[#121212] border border-[#27272A]" />
              <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#27272A]" />
              <div className="w-8 h-8 rounded-lg bg-[#D4FF00] border border-[#D4FF00]/50" />
            </div>
          </div>
        </div>
      ),
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure notification preferences",
      content: (
        <div className="space-y-3">
          {["New lead assigned", "Status change alerts", "Task reminders", "Weekly summary"].map(
            (item) => (
              <div
                key={item}
                className="flex items-center justify-between bg-[#121212] rounded-lg p-3"
              >
                <span className="text-sm text-[#A1A1AA]">{item}</span>
                <div className="w-10 h-5 rounded-full bg-[#D4FF00] flex items-center px-0.5">
                  <div className="w-4 h-4 rounded-full bg-black ml-auto" />
                </div>
              </div>
            )
          )}
        </div>
      ),
    },
    {
      icon: HelpCircle,
      title: "About",
      description: "LeadFlow CRM information",
      content: (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#52525B]">Version</span>
            <span className="text-[#A1A1AA]">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#52525B]">Stack</span>
            <span className="text-[#A1A1AA]">React + tRPC + Drizzle + MySQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#52525B]">Auth</span>
            <span className="text-[#A1A1AA]">OAuth 2.0 (Kimi)</span>
          </div>
          <div className="pt-3 border-t border-[#27272A]">
            <p className="text-xs text-[#3F3F46]">
              LeadFlow CRM is a modern sales management platform designed for
              small businesses, agencies, and sales teams.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#52525B] mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="glass-card overflow-hidden">
            <div className="p-4 border-b border-[#27272A] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#121212] flex items-center justify-center">
                <section.icon size={18} className="text-[#D4FF00]" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{section.title}</h3>
                <p className="text-xs text-[#52525B]">{section.description}</p>
              </div>
            </div>
            <div className="p-4">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
