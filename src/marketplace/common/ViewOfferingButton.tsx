import { useRouter } from '@uirouter/react';
import { Offering } from 'waldur-js-client';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';

export const ViewOfferingButton = ({
  offering,
  disabled,
  disabledReason,
}: {
  offering: Offering;
  disabled?: boolean;
  disabledReason?: string;
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.stateService.go('public-offering.marketplace-public-offering', {
      uuid: offering.uuid,
    });
  };

  return (
    <CompactSubmitButton
      submitting={false}
      type="button"
      variant="text-primary"
      disabled={disabled}
      onClick={handleClick}
      label={translate('View offering')}
      disabledReason={disabledReason}
    />
  );
};
