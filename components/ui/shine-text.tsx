"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ShineTextProps {
  text: string;
  className?: string;
  primaryColor?: string;
  speed?: "slow" | "medium" | "fast";
  repeat?: boolean;
}

export const ShineText = ({
  text,
  className,
  primaryColor = "rgb(var(--primary))",
  speed = "medium",
  repeat = true,
}: ShineTextProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation duration based on speed
  const duration = {
    slow: "4s",
    medium: "2.5s",
    fast: "1.5s",
  };

  if (!mounted)
    return <span className={cn("inline-block", className)}>{text}</span>;

  return (
    <span className={cn("relative inline-block", className)}>
      {/* Base text that adapts to theme */}
      <span className="relative z-10">{text}</span>

      {/* Shine overlay */}
      <span
        className="absolute inset-0 z-20 overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="absolute inset-0 z-20"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: `shine-effect ${duration[speed]} linear ${
              repeat ? "infinite" : "1"
            }`,
          }}
        >
          {text}
        </span>
      </span>

      <style jsx>{`
        @keyframes shine-effect {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </span>
  );
};
