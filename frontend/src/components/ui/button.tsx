import * as React from "react"

export function Button({ className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`
        bg-blue-600
        hover:bg-blue-700
        active:bg-blue-800
        disabled:bg-blue-300
        text-white
        font-semibold
        rounded
        px-4 py-2
        transition-colors
        focus:outline-none
        focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        shadow-sm
        ${className}
      `}
      {...props}
    />
  );
}
