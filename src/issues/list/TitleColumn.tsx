import { FunctionComponent } from 'react';

import { Tooltip } from 'waldur-ui';

export const TitleColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Tooltip label={row.summary}>
    <span className="ellipsis w-37.5">{row.summary}</span>
  </Tooltip>
);
