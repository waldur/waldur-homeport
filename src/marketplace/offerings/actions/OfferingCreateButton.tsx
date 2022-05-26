import { UISref } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const OfferingCreateButton: FunctionComponent = () => (
  <UISref to="marketplace-offering-create">
    <Button className="me-3">
      <i className="fa fa-plus" /> {translate('Add offering')}
    </Button>
  </UISref>
);
