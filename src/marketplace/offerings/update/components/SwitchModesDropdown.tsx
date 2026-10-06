import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { OfferingSectionProps } from '../types';

import { ChangeStorageModeAction } from './ChangeStorageModeAction';
import { SwitchBillingModeAction } from './SwitchBillingModeAction';

export const SwitchModesDropdown: FC<OfferingSectionProps> = (props) => {
  return (
    <ActionsMenu
      toggle="labeled"
      label={
        <>
          <ArrowsClockwiseIcon weight="bold" className="me-1" />
          {translate('Switch modes')}
        </>
      }
      variant="tertiary"
    >
      <SwitchBillingModeAction {...props} />
      <ChangeStorageModeAction {...props} />
    </ActionsMenu>
  );
};
