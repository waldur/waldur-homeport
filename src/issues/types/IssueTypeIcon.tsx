import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

import { getIconForType } from './constants';

export const IssueTypeIcon: FunctionComponent<{ type: string }> = ({
  type,
}) => {
  const iconNode = getIconForType(type);
  return (
    <Tip id="issue-type-icon" label={type}>
      {iconNode}
    </Tip>
  );
};
