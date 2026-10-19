import { ChartBarIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { TosReportingModal } from './TosReportingModal';

interface TosReportingButtonProps {
  offeringUuid?: string;
  providerUuid?: string;
  asDropdownItem?: boolean;
}

export const TosReportingButton: FC<TosReportingButtonProps> = ({
  offeringUuid,
  providerUuid,
  asDropdownItem,
}) => {
  const { openDialog } = useModal();
  const open = () =>
    openDialog(TosReportingModal, {
      size: 'xl',
      resolve: { offeringUuid, providerUuid },
    });

  return (
    <>
      {asDropdownItem ? (
        <ActionItem
          title={translate('ToS reporting')}
          action={open}
          iconNode={<ChartBarIcon weight="bold" />}
        />
      ) : (
        <BaseButton
          label={translate('ToS reporting')}
          iconNode={<ChartBarIcon weight="bold" />}
          onClick={open}
          variant="tertiary"
          size="lg"
        />
      )}
    </>
  );
};
