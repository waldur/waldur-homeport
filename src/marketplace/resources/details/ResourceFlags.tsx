import {
  ArrowsInSimpleIcon,
  PauseCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { translate } from '@waldur/i18n';

export const ResourceFlags = ({ resource }: { resource: Resource }) => {
  return (
    <>
      {resource.restrict_member_access && (
        <Badge
          leftIcon={<XCircleIcon />}
          variant="danger"
          outline
          pill
          size="sm"
        >
          {translate('Access restricted')}
        </Badge>
      )}
      {resource.paused && (
        <Badge
          leftIcon={<PauseCircleIcon />}
          variant="danger"
          outline
          pill
          size="sm"
        >
          {translate('Paused')}
        </Badge>
      )}
      {resource.downscaled && (
        <Badge
          leftIcon={<ArrowsInSimpleIcon />}
          variant="danger"
          outline
          pill
          size="sm"
        >
          {translate('Downscaled')}
        </Badge>
      )}
    </>
  );
};
