import { useState, useRef, useEffect } from "react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({ title, value, trend, trendUp, icon, className }: MetricCardProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#27272A] bg-[#18181B] p-6 group transition-all duration-300 hover:border-[#3F3F46]",
        className
      )}
    >
      {/* Spotlight overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />

      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-[#52525B] text-sm font-medium">{title}</p>
          {icon && <span className="text-[#52525B]">{icon}</span>}
        </div>
        <h3 className="text-3xl font-semibold text-white font-display">{value}</h3>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trendUp !== undefined
                ? trendUp
                  ? "text-[#D4FF00]"
                  : "text-red-400"
                : "text-[#D4FF00]"
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
