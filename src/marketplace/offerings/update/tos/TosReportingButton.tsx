import { ChartBarIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {asDropdownItem ? (
        <ActionItem
          title={translate('ToS reporting')}
          action={() => setIsOpen(true)}
          iconNode={<ChartBarIcon weight="bold" />}
        />
      ) : (
        <BaseButton
          label={translate('ToS reporting')}
          iconNode={<ChartBarIcon weight="bold" />}
          onClick={() => setIsOpen(true)}
          variant="tertiary"
          size="lg"
        />
      )}
      {isOpen && (
        <TosReportingModal
          offeringUuid={offeringUuid}
          providerUuid={providerUuid}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
