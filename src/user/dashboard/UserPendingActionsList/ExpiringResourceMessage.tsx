import { FC } from 'react';

import { translate } from '@/i18n';

import { ActionContext } from './ActionContext';
import { ExtendedUserAction } from './types';

export const ExpiringResourceMessage: FC<{ row: ExtendedUserAction }> = ({
  row,
}) => {
  return (
    <div>
      <div className="text-muted small mb-2">
        {translate(
          'This resource will expire soon. Review and renew to prevent downtime.',
        )}
      </div>
      <ActionContext row={row as any} />
    </div>
  );
};
