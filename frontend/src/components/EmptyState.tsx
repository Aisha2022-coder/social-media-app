"use client";

export default function EmptyState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-3">
        <circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="2" fill="#f1f5f9" />
        <path d="M8 12h8M8 16h4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="text-lg mb-2">{message}</div>
      {children}
    </div>
  );
} 