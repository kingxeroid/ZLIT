import { motion } from "framer-motion";

const styles = {
  primary:
    "bg-zlit-red text-white hover:bg-red-800",
  secondary:
    "bg-zlit-surface text-zlit-white hover:bg-zlit-hover",
  outline:
    "border border-white/15 text-zlit-white hover:bg-white/5",
  ghost:
    "text-zlit-muted hover:bg-white/5 hover:text-white",
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const sizes = {
    sm: "px-4 py-2 text-[11px]",
    md: "px-5 py-2.5 text-xs",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.96 } : undefined}
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full font-semibold transition duration-200
        disabled:cursor-not-allowed disabled:opacity-50
        ${styles[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}

      {children}
    </motion.button>
  );
}