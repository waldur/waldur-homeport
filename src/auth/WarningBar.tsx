import { ReactNode, useContext } from 'react';

import { PermissionContext } from './PermissionLayout';

import './WarningBar.scss';

export default function WarningBar() {
  const { permission, banner } = useContext(PermissionContext);

  if (permission === 'custom') {
    return banner as ReactNode;
  }

  if (
    permission !== 'allowed' &&
    typeof banner === 'object' &&
    'title' in banner
  )
    return (
      <div
        className={
          permission === 'restricted' ? 'bar bar-danger' : 'bar bar-warning'
        }
      >
        <div className={banner?.options?.className ?? ''}>
          <p>
            <strong>{banner.title}</strong>
            {Boolean(banner.title && banner.message) && ':'} {banner.message}
          </p>
        </div>
      </div>
    );

  return null;
}
