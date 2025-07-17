import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className = '',
  variant = "primary",
  leftIcon,
  rightIcon,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm text-base select-none";
  let styles = "";
  if (variant === "primary") {
    styles =
      "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed";
  } else if (variant === "secondary") {
    styles =
      "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed";
  } else if (variant === "outline") {
    styles =
      "bg-transparent border border-indigo-500 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed";
  }
  return (
    <button
      className={`${base} ${styles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
    </button>
  );
}
