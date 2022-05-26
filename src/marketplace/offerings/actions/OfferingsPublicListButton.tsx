import { UISref } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const OfferingsPublicListButton: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  return (
    <UISref
      to="marketplace-service-provider.details"
      params={{
        uuid: customer.uuid,
      }}
    >
      <Button target="_blank" className="me-3">
        <i className="fa fa-external-link" /> {translate('Public list')}
      </Button>
    </UISref>
  );
};
