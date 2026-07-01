import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { IconButton, MediumIconButton } from '@/core/buttons/IconButton';
import { translate } from '@/i18n';

/**
 * Shared drawer close (X): a tertiary-ghost button, medium on tablet+ and large
 * on mobile. Used by every drawer toolbar so the control looks identical and
 * sits in the same spot. Its props match the drawer `toolbar` contract, so it
 * can also be passed straight as a drawer's `toolbar` when no other controls
 * are needed.
 */
export const DrawerCloseButton: FC<{ close: () => void }> = ({ close }) => (
  <>
    <span className="d-none d-md-inline-flex">
      <MediumIconButton
        iconNode={<XIcon weight="bold" />}
        tooltip={translate('Close')}
        onClick={close}
        variant="tertiary-ghost"
        tooltipPlacement="bottom"
      />
    </span>
    <span className="d-inline-flex d-md-none">
      <IconButton
        iconNode={<XIcon weight="bold" />}
        tooltip={translate('Close')}
        onClick={close}
        variant="tertiary-ghost"
        tooltipPlacement="bottom"
      />
    </span>
  </>
);
