import { ArrowsInSimpleIcon, ArrowsOutSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { MediumIconButton } from '@/core/buttons/IconButton';
import { translate } from '@/i18n';

import { DrawerCloseButton } from './DrawerCloseButton';
import { useDrawerExpand } from './useDrawerExpand';

/**
 * Drawer toolbar with a full-screen toggle beside the close button. The toggle
 * is desktop-only — on narrow viewports the drawer already fills the screen.
 */
export const DrawerExpandToolbar: FC<{ close: () => void }> = ({ close }) => {
  const { expanded, toggle: toggleExpand } = useDrawerExpand();

  return (
    <>
      <span className="d-none d-lg-inline-flex">
        <MediumIconButton
          iconNode={
            expanded ? (
              <ArrowsInSimpleIcon weight="bold" />
            ) : (
              <ArrowsOutSimpleIcon weight="bold" />
            )
          }
          tooltip={
            expanded
              ? translate('Collapse to panel')
              : translate('Expand to full screen')
          }
          onClick={toggleExpand}
          variant="tertiary-ghost"
          tooltipPlacement="bottom"
        />
      </span>
      <DrawerCloseButton close={close} />
    </>
  );
};
