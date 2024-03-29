import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

export const TitleColumn: FunctionComponent<{ row }> = ({ row }) => (
  <Tip id="title-tooltip" label={row.summary}>
    <span className="ellipsis" style={{ width: 150 }}>
      {row.summary}
    </span>
  </Tip>
);
