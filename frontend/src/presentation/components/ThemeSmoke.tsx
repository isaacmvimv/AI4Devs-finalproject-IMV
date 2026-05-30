/**
 * Smoke visual del tema ConRutina — valida tokens Tailwind del DoD T-05-02.
 * Referencia de clases: bg-primary, bg-completed, bg-failed, bg-pending, bg-background, bg-surface.
 */
export default function ThemeSmoke() {
  const swatches = [
    { label: 'Primary', className: 'bg-primary text-white' },
    { label: 'Completed', className: 'bg-completed text-white' },
    { label: 'Failed', className: 'bg-failed text-white' },
    { label: 'Pending', className: 'bg-pending text-gray-800' },
    { label: 'Background', className: 'bg-background text-gray-800 border border-gray-300' },
    { label: 'Surface', className: 'bg-surface text-gray-800 border border-gray-300' },
  ] as const

  return (
    <section
      data-testid="theme-smoke"
      aria-label="Tema ConRutina — smoke visual"
      className="mb-6 rounded-2xl border border-dashed border-gray-300 bg-surface p-4 shadow-sm"
    >
      <h2 className="mb-3 text-sm font-semibold text-gray-600">Tema ConRutina (T-05-02)</h2>
      <div className="flex flex-wrap gap-3">
        {swatches.map(({ label, className }) => (
          <div
            key={label}
            className={`flex h-12 min-w-[7rem] items-center justify-center rounded-lg px-3 text-xs font-medium ${className}`}
          >
            {label}
          </div>
        ))}
      </div>
    </section>
  )
}
