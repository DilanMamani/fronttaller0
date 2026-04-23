import { Eye, EyeOff } from 'lucide-react';

// componente de Input reutilizable dasd

export default function InputField({ 
  id, 
  label, 
  type, 
  placeholder, 
  value, 
  onChange, 
  autoComplete, 
  showPassword, 
  onTogglePassword 
}) {
  return (
    <div className="space-y-2">
      <label 
      htmlFor={id} 
      className="block text-sm font-medium text-foreground-light dark:text-foreground-dark">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="block w-full rounded-lg border-2 border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 h-12 px-4 placeholder:text-muted-light dark:placeholder:text-muted-dark"
        />
        {id === 'password' && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}