import { Button } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

import { Offering } from '../types';

export const ViewOfferingButton = ({
  offering,
  disabled,
}: {
  offering: Offering;
  disabled?: boolean;
}) =>
  disabled ? (
    <Button variant="text-primary" className="btn-sm" disabled>
      {translate('Details')}
    </Button>
  ) : (
    <Link
      state="public-offering.marketplace-public-offering"
      params={{ uuid: offering.uuid }}
      buttonVariant="text-primary"
      className="btn-sm"
    >
      {translate('Details')}
    </Link>
  );
