import UserProfile from './UserProfile';

export default function Header({ title, onMenuClick }) {
  
  return (
    <>
      <header className="h-16 bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Boton  hamburguesa */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark flex-shrink-0 items-center justify-center"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight truncate items-center">{title}</h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <UserProfile />
        </div>
      </header>
    </>
  );
}