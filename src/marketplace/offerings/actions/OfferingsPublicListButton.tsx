import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const OfferingsPublicListButton: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const router = useRouter();
  const url = router.stateService.href('marketplace-service-provider.details', {
    uuid: customer.uuid,
  });
  return (
    <Button bsSize="sm" href={url} target="_blank">
      <i className="fa fa-external-link" /> {translate('Public list')}
    </Button>
  );
};
