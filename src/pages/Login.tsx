import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function Login() {
  const { user, isLoading, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-[#D4FF00] animate-spin" />
          <span className="text-[#52525B] text-sm">Checking authentication...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#D4FF00] flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#000"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">LeadFlow CRM</h1>
          <p className="text-sm text-[#52525B] mt-1">Sign in to access your dashboard</p>
        </div>

        <div className="bg-[#121212] border border-[#27272A] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#A1A1AA]">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="bg-[#0A0A0A] border-[#27272A] text-white placeholder:text-[#52525B] focus-visible:ring-[#D4FF00]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#A1A1AA]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="bg-[#0A0A0A] border-[#27272A] text-white placeholder:text-[#52525B] focus-visible:ring-[#D4FF00]"
              />
            </div>
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-[#D4FF00] text-black font-medium hover:bg-[#c5f000] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,255,0,0.3)] rounded-full h-11 transition-all"
              size="lg"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-[#52525B] mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-[#D4FF00] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
