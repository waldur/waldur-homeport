import { ArrowsInSimpleIcon, ArrowsOutSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { MediumIconButton } from '@/core/buttons/IconButton';
import { DrawerCloseButton } from '@/drawer/DrawerCloseButton';
import { useDrawerExpand } from '@/drawer/useDrawerExpand';
import { translate } from '@/i18n';

export const SupportDrawerToolbar: FC<{ close: () => void }> = ({ close }) => {
  const { expanded, toggle: toggleExpand } = useDrawerExpand();

  return (
    <>
      {/* Desktop: expand/collapse */}
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
