import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { SupportResourcesFilter } from './SupportResourcesFilter';
import { SupportResourcesList } from './SupportResourcesList';

export const SupportResourcesContainer: FunctionComponent = () => {
  useTitle(translate('Resources'));
  return (
    <Card>
      <Card.Body>
        <SupportResourcesList filters={<SupportResourcesFilter />} />
      </Card.Body>
    </Card>
  );
};
