import { ResourceSummary } from '@waldur/resource/summary/ResourceSummary';

import { SecurityGroupRulesList } from './SecurityGroupRulesList';

export const SecurityGroupExpandableRow = ({ row }) => {
  return (
    <>
      <ResourceSummary resource={row} />
      <SecurityGroupRulesList resource={row} />
    </>
  );
};
