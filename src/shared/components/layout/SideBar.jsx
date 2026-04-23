// src/components/Sidebar.jsx
import { useSelector } from 'react-redux';
import { navItems } from '../../config/navConfig'
import { selectUser } from '../../../features/login/slices/loginSelectors';
import { getFilteredNavItems } from '../../config/roleConfig';
import NavItem from './NavItem';

export default function Sidebar({ isOpen, onClose }) {
  const user = useSelector(selectUser);

  const filteredNavItems = getFilteredNavItems(navItems, user?.rol);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 flex-shrink-0 
          bg-card-light dark:bg-card-dark 
          border-r border-border-light dark:border-border-dark 
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between border-b border-border-light dark:border-border-dark gap-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">health_cross</span>
            </div>
            <h1 className="text-lg font-bold">Sacramentos</h1>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.length > 0 ? (
            filteredNavItems.map((item) => (
              <NavItem key={item.label} item={item} onClick={onClose} />
            ))
          ) : (
            <div className="text-center text-muted-light dark:text-muted-dark py-4">
              No hay opciones disponibles
            </div>
          )}
        </nav>
        {/*  usuario pa celu */}
        <div className="border-t border-border-light dark:border-border-dark p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuario'}</p>
              <p className="text-xs text-muted-light dark:text-muted-dark truncate">
                {user?.rol || 'Sin rol'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}