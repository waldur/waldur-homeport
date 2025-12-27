import { useRouter } from '@uirouter/react';
import { Button } from 'react-bootstrap';

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
    <Button
      variant="text-primary"
      className="btn-sm"
      disabled={disabled}
      onClick={handleClick}
    >
      {translate('Details')}
    </Button>
  );
};
