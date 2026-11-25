import React from "react";
import { CheckCircle2, Calendar, AlertOctagon } from "lucide-react";

export type BadgeVariant = "self-care" | "see-doctor" | "emergency";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}

const badgeConfig: Record<
  BadgeVariant,
  {
    classes: string;
    defaultLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  "self-care": {
    classes:
      "bg-urgency-green-bg text-urgency-green border border-[#86EFAC]/60",
    defaultLabel: "Level 1: Self-Care",
    icon: CheckCircle2,
  },
  "see-doctor": {
    classes:
      "bg-urgency-amber-bg text-amber-900 border border-[#FDE68A]/70",
    defaultLabel: "Level 2: See Doctor Soon",
    icon: Calendar,
  },
  emergency: {
    classes:
      "bg-urgency-red-bg text-urgency-red border border-[#FCA5A5]/70 font-semibold",
    defaultLabel: "Level 3: Emergency Care",
    icon: AlertOctagon,
  },
};

export function Badge({
  variant = "self-care",
  label,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const config = badgeConfig[variant];
  const IconComponent = config.icon;
  const contentText = label || children || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-medium select-none shadow-2xs ${config.classes} ${className}`}
      {...props}
    >
      <IconComponent className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{contentText}</span>
    </span>
  );
}
