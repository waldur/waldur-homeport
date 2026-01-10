import { useRouter } from '@uirouter/react';

import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { translate } from '@waldur/i18n';

import { Offering } from '../types';

export const ViewOfferingButton = ({
  offering,
  disabled,
}: {
  offering: Offering;
  disabled?: boolean;
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
      label={translate('Details')}
    />
  );
};
