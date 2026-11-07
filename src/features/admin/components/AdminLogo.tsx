export function AdminLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M24 3.5 44.5 24 24 44.5 3.5 24Z"
        fill="#f9cf4a"
        stroke="#f9cf4a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 17.5 24 24l-6.5 6.5M24.5 17.5 31 24l-6.5 6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
