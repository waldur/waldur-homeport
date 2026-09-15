import { FunctionComponent } from 'react';

import { Tooltip } from 'waldur-ui';

export const TitleColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Tooltip label={row.summary}>
    <span style={{ width: 150 }} className="ellipsis">
      {row.summary}
    </span>
  </Tooltip>
);
