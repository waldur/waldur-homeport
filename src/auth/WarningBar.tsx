import { ReactNode, useContext } from 'react';

import { LayoutWarningBar } from '@/navigation/LayoutWarningBar';

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
      <LayoutWarningBar
        variant={permission === 'restricted' ? 'danger' : 'warning'}
        title={
          banner.title && banner.message ? `${banner.title}:` : banner.title
        }
        icon={null}
        centered
        className={banner?.options?.className}
      >
        {banner.message}
      </LayoutWarningBar>
    );

  return null;
}
