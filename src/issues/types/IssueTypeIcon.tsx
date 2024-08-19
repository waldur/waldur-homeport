import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';

import { ISSUE_ICONS } from './constants';

export const IssueTypeIcon: FunctionComponent<{ type }> = ({ type }) => {
  const typeId = type.toUpperCase().replace(' ', '_');
  const iconNode = ISSUE_ICONS[typeId] || ISSUE_ICONS.INCIDENT;
  return (
    <Tip id="issue-type-icon" label={type}>
      {iconNode}
    </Tip>
  );
};
