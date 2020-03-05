import * as React from 'react';

import { formatDateTime, formatFromNow } from '@waldur/core/dateUtils';

export const CreatedField = (props: { resource: { created?: string } }) =>
  props.resource.created ? (
    <span>
      {formatFromNow(props.resource.created)}
      {', '}
      {formatDateTime(props.resource.created)}
    </span>
  ) : null;
