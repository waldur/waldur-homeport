import { FunctionComponent } from 'react';
import { Button, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { useCreateOrganization } from './utils';

const InitialCreateOrganizationButton = () => {
  const [enabled, onClick] = useCreateOrganization();
  if (!enabled) {
    return null;
  }
  return (
    <div>
      <Button onClick={onClick as any}>
        <i className="fa fa-plus" /> {translate('Add new organization')}
      </Button>
    </div>
  );
};

export const EmptyOrganizationsPlaceholder: FunctionComponent = () => (
  <Row>
    <div className="middle-box text-center">
      <h3 className="font-bold m-b-lg">
        {translate('You do not belong to any organization yet')}.
      </h3>
      <InitialCreateOrganizationButton />
    </div>
  </Row>
);
