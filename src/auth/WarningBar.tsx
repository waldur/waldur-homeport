import { useContext } from 'react';

import { PermissionContext } from './PermissionLayout';

import './WarningBar.scss';

export default function WarningBar() {
  const { permission, banner } = useContext(PermissionContext);

  return permission !== 'allowed' ? (
    <div
      className={
        permission === 'restricted' ? 'bar bar-danger' : 'bar bar-warning'
      }
    >
      <p>
        <strong>{banner.title}</strong>
        {Boolean(banner.title && banner.message) && ':'} {banner.message}
      </p>
    </div>
  ) : null;
}
