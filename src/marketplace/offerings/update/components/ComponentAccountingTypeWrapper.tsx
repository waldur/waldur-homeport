import { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const ComponentAccountingTypeWrapper: FC<PropsWithChildren> = ({
  children,
}) => (
  <Card className="card-bordered card-solid bg-gray-50 min-h-175px">
    <Card.Body className="p-4">
      <Card.Title as="h6" className="fw-bold mb-5">
        {translate('Accounting type settings')}
      </Card.Title>
      {children}
    </Card.Body>
  </Card>
);
