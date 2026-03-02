import { Link } from '@waldur/core/Link';

export const MenuItem = ({
  label,
  state,
  icon,
  className = 'px-3',
}: {
  label: string;
  state: string;
  icon?: React.ReactNode;
  className?: string;
}) => (
  <li className="menu-item" data-kt-menu-trigger="click">
    <Link className={`menu-link ${className}`} state={state}>
      {icon && <span className="menu-icon">{icon}</span>}
      <span className="menu-title">{label}</span>
    </Link>
  </li>
);
