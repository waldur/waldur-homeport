import classNames from 'classnames';
import { ReactNode, useContext } from 'react';

import { PermissionContext } from './PermissionLayout';

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
          permission === 'restricted'
            ? 'layout-warning-bar bar-danger'
            : 'layout-warning-bar bar-warning'
        }
      >
        <div
          className={classNames(
            'w-100 text-center',
            banner?.options?.className,
          )}
        >
          <p className="mb-0 py-2">
            <strong>{banner.title}</strong>
            {Boolean(banner.title && banner.message) && ':'} {banner.message}
          </p>
        </div>
      </div>
    );

  return null;
}
