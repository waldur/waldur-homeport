import { useContext } from 'react';

import { LayoutWarningBar } from '@/navigation/LayoutWarningBar';

import { PermissionContext } from './PermissionLayout';

export default function WarningBar() {
  const { permission, banner } = useContext(PermissionContext);

  if (permission !== 'allowed' && banner?.title)
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
