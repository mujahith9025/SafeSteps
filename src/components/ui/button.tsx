import React from "react";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "emergency" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  asExternal?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-active focus-visible:ring-3 focus-visible:ring-primary-light shadow-xs border border-transparent",
  secondary:
    "bg-transparent text-text-main border-1.5 border-border hover:bg-background hover:border-slate-300 active:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary",
  emergency:
    "bg-urgency-red text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-3 focus-visible:ring-urgency-red-bg shadow-xs border border-transparent",
  ghost:
    "bg-transparent text-primary hover:bg-primary-light/60 active:bg-primary-light focus-visible:ring-2 focus-visible:ring-primary border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-caption font-medium rounded-xl gap-2",
  md: "h-12 px-6 text-[16px] leading-6 font-semibold rounded-xl gap-2.5", // 48px default height, 12px radius, label-md
  lg: "h-14 sm:h-16 px-8 text-lg font-bold rounded-2xl gap-3",
};

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      asExternal = false,
      className = "",
      disabled = false,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center transition-colors font-sans select-none focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer";
    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

    if (href) {
      if (asExternal || href.startsWith("http") || href.startsWith("tel:")) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={combinedClasses}
            target={asExternal ? "_blank" : undefined}
            rel={asExternal ? "noopener noreferrer" : undefined}
            aria-disabled={disabled ? "true" : undefined}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClasses}
          aria-disabled={disabled ? "true" : undefined}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
