export function Flame({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2c.6 4.4-.9 6.3-3 8.4C7 12.4 5.5 14.3 5.5 17a6.5 6.5 0 0 0 13 0c0-2.7-1.5-4.6-3.5-6.6-1-1-1.9-2-2.3-3.4C12.4 5.6 12.2 4 12 2z" />
      <path
        d="M12 21.5a3.5 3.5 0 0 1-3.5-3.5c0-1.6 1-2.7 2-3.7.7-.7 1.3-1.4 1.5-2.3.2.9.8 1.6 1.5 2.3 1 1 2 2.1 2 3.7a3.5 3.5 0 0 1-3.5 3.5z"
        className="text-paper"
        fill="currentColor"
      />
    </svg>
  );
}

export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="inline-flex items-center gap-1.5 select-none">
      <Flame
        className={`text-ember ${size === "lg" ? "h-8 w-8" : "h-6 w-6"}`}
      />
      <span
        className={`font-semibold tracking-tight ${
          size === "lg" ? "text-2xl" : "text-lg"
        }`}
      >
        ember
      </span>
    </span>
  );
}
