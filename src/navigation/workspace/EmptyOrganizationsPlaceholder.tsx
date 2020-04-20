import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';

import { useCreateOrganization } from './utils';

const InitialCreateOrganizationButton = () => {
  const [enabled, onClick] = useCreateOrganization();
  if (!enabled) {
    return null;
  }
  return (
    <div>
      <Button onClick={onClick}>
        <i className="fa fa-plus" /> {translate('Add new organization')}
      </Button>
    </div>
  );
};

export const EmptyOrganizationsPlaceholder = () => (
  <Row>
    <div className="middle-box text-center">
      <h3 className="font-bold m-b-lg">
        {translate('You do not belong to any organization yet')}.
      </h3>
      <InitialCreateOrganizationButton />
    </div>
  </Row>
);
