import { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';

export const ComponentAccountingTypeWrapper: FC<PropsWithChildren> = ({
  children,
}) => (
  <Card className="card-bordered card-solid bg-secondary min-h-[175px]">
    <Card.Body className="p-3">
      <Card.Title as="h6" className="font-medium mb-4">
        {translate('Accounting type settings')}
      </Card.Title>
      {children}
    </Card.Body>
  </Card>
);
