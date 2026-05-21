export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg shadow-lg px-4 py-3 text-white ${
        toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined">
          {toast.type === 'success' ? 'check_circle' : 'error'}
        </span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}