import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = memo(({ item, onClick }) => {
  const location = useLocation();
  const active = !item.disabled && location.pathname.startsWith(item.to);
  const baseCls = 'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors';
  const cls = active
    ? `${baseCls} bg-primary/10 dark:bg-primary/20 text-primary font-semibold`
    : item.disabled
    ? `${baseCls} text-muted-light dark:text-muted-dark cursor-not-allowed`
    : `${baseCls} hover:bg-primary/10 dark:hover:bg-primary/20`;

  if (item.disabled) {
    return (
      <span className={cls} aria-disabled="true">
        <span className="material-symbols-outlined">{item.icon}</span>
        <span>{item.label}</span>
      </span>
    );
  }

  return (
    <Link to={item.to} className={cls} aria-label={item.label} onClick={onClick}>
      <span className="material-symbols-outlined">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
});

export default NavItem;