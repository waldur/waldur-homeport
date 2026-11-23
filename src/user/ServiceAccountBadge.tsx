import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

/** Marks a user created for an integration rather than a person. */
export const ServiceAccountBadge: FC<{ show?: boolean | null }> = ({ show }) =>
  show ? (
    <Badge
      variant="neutral"
      tooltip={translate(
        'Created for an integration such as a site agent; it signs in with its token.',
      )}
      data-testid="service-account-badge"
      className="shrink-0 whitespace-nowrap"
    >
      {translate('Service account')}
    </Badge>
  ) : null;
