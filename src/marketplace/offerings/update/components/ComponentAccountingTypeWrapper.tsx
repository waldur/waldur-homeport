import { FC, PropsWithChildren } from 'react';

import { Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';

export const ComponentAccountingTypeWrapper: FC<PropsWithChildren> = ({
  children,
}) => (
  <Card bordered variant="solid" className="bg-secondary min-h-[175px]">
    <CardContent className="p-3">
      <h6 className="font-medium mb-4">
        {translate('Accounting type settings')}
      </h6>
      {children}
    </CardContent>
  </Card>
);
