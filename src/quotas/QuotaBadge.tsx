import { useMemo } from 'react';

import { Badge } from '@waldur/core/Badge';

import { Quota } from './types';
import { formatQuota } from './utils';

export const QuotaBadge = ({
  quota,
  image,
  className,
}: {
  quota: Quota;
  image?: string;
  className?: string;
}) => {
  const data = useMemo(() => formatQuota(quota), [quota]);

  return (
    <Badge
      variant="default"
      outline
      className={'fw-normal ' + (className ?? '')}
    >
      {Boolean(image) && (
        <img src={image} alt="quota" width={15} className="me-2" />
      )}
      {data.usage}/{data.limit} {data.label}
    </Badge>
  );
};
