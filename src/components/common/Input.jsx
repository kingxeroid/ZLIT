import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    className = "",
    ...props
  },
  ref
) {
  return (
    <div className="grid gap-2">
      {label && (
        <label className="text-xs font-medium text-zlit-muted">
          {label}
        </label>
      )}

      <div
        className={`
          flex items-center gap-3 rounded-full
          border bg-zlit-surface px-4 transition
          ${error ? "border-zlit-red" : "border-white/10 focus-within:border-zlit-red"}
        `}
      >
        {Icon && (
          <Icon size={17} className="shrink-0 text-zlit-muted" />
        )}

        <input
          ref={ref}
          className={`
            min-w-0 flex-1 bg-transparent py-3
            text-sm text-zlit-white outline-none
            placeholder:text-zlit-muted/60
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="px-3 text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;