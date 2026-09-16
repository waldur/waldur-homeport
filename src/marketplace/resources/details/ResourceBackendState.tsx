import { XCircleIcon } from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

export const ResourceBackendState = ({ resource }: { resource: Resource }) => {
  if (!resource.scope || resource.backend_metadata.state !== 'Erred') {
    return null;
  }
  return (
    <Tooltip label={translate('Backend state: Erred')}>
      <Badge variant="danger" size="sm" shape="pill" tone="outline" onlyIcon>
        <XCircleIcon weight="bold" size={12} />
      </Badge>
    </Tooltip>
  );
};
