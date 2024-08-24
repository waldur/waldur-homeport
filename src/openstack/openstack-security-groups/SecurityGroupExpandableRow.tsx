import { SecurityGroupRulesList } from './SecurityGroupRulesList';

export const SecurityGroupExpandableRow = ({ row }) => {
  return <SecurityGroupRulesList resource={row} />;
};
