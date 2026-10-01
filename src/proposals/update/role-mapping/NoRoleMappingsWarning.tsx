import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

// Allocation copies the proposal team onto the new project only through these
// mappings, so a call without any hands out projects nobody can access.
export const NoRoleMappingsWarning: FC<{ className?: string }> = ({
  className,
}) => (
  <AlertItem
    type="floating"
    variant="warning"
    className={className}
    title={translate('No role mappings')}
    body={translate(
      'Projects allocated from approved proposals will have nobody on them: not the applicant, not the proposal team. Mappings can be added at any time, but only apply to proposals approved afterwards.',
    )}
  />
);
