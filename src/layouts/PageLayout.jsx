export default function PageLayout({
  children,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <section className={`mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 ${className}`}>
      {(title || action) && (
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            {title && (
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h1>
            )}

            {description && (
              <p className="mt-2 text-sm text-zlit-muted">
                {description}
              </p>
            )}
          </div>

          {action}
        </div>
      )}

      {children}
    </section>
  );
}