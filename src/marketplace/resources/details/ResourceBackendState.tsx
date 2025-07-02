import { XCircleIcon } from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const ResourceBackendState = ({ resource }: { resource: Resource }) => {
  if (!resource.scope || resource.backend_metadata.state !== 'Erred') {
    return null;
  }
  return (
    <Tip
      id="tip-resource-backend-state"
      label={translate('Backend state') + ': ' + translate('Erred')}
    >
      <Badge variant="danger" outline pill onlyIcon size="sm">
        <XCircleIcon weight="bold" size={12} />
      </Badge>
    </Tip>
  );
};
