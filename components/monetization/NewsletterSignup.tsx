"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsletterSignupProps {
  variant?: "light" | "dark";
}

export function NewsletterSignup({ variant = "light" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-emerald-500/12 p-4 text-emerald-300">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Subscription confirmed.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Mail
          className={cn(
            "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
            variant === "dark" ? "text-slate-500" : "text-gray-400"
          )}
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={cn(
            "w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2",
            variant === "dark"
              ? "border-white/15 bg-[#0F1218] text-slate-100 placeholder-slate-500 focus:ring-blue-500/25"
              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-brand-500/20"
          )}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
          variant === "dark"
            ? "bg-blue-600 text-white hover:bg-blue-500"
            : "bg-brand-600 text-white hover:bg-brand-700"
        )}
      >
        {status === "loading" ? "..." : "Get Briefing"}
      </button>
    </form>
  );
}
