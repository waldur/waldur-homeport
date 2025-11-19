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
          variant="danger"
          size="sm"
          leftIcon={<XCircleIcon weight="bold" />}
          pill
          outline
        >
          {translate('Access restricted')}
        </Badge>
      )}
      {resource.paused && (
        <Badge
          variant="danger"
          size="sm"
          leftIcon={<PauseCircleIcon weight="bold" />}
          pill
          outline
        >
          {translate('Paused')}
        </Badge>
      )}
      {resource.downscaled && (
        <Badge
          variant="danger"
          size="sm"
          leftIcon={<ArrowsInSimpleIcon weight="bold" />}
          pill
          outline
        >
          {translate('Downscaled')}
        </Badge>
      )}
    </>
  );
};
