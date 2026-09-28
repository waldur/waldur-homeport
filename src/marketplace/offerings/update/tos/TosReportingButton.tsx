import { ChartBarIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { TosReportingModal } from './TosReportingModal';

interface TosReportingButtonProps {
  offeringUuid?: string;
  providerUuid?: string;
}

export const TosReportingButton: FC<TosReportingButtonProps> = ({
  offeringUuid,
  providerUuid,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BaseButton
        label={translate('ToS reporting')}
        iconNode={<ChartBarIcon weight="bold" />}
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        size="lg"
      />
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
