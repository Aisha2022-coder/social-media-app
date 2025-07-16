"use client";

export default function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div
        className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
        style={{ width: size, height: size, borderTopColor: '#3b82f6' }}
      />
    </div>
  );
} 