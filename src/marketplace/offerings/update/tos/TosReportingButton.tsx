import { ChartBarIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

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
      <ActionButton
        title={translate('ToS reporting')}
        iconNode={<ChartBarIcon weight="bold" />}
        action={() => setIsOpen(true)}
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
