import { FC, PropsWithChildren } from 'react';

import { translate } from '@/i18n';

export const ComponentAccountingTypeWrapper: FC<PropsWithChildren> = ({
  children,
}) => (
  <div className="card card-bordered card-solid bg-secondary min-h-[175px]">
    <div className="card-body p-3">
      <h6 className="card-title font-medium mb-4">
        {translate('Accounting type settings')}
      </h6>
      {children}
    </div>
  </div>
);
