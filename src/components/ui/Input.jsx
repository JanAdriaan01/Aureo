export default function Input({ label, value, onChange, type = "text", required = false, error }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-zinc-600">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`px-4 py-2 rounded-xl border ${error ? 'border-red-300 bg-red-50' : 'border-zinc-300'}`}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}