import { useAsync } from 'react-use';

import { countRobotAccounts } from '@waldur/marketplace/common/api';

import { RobotAccountList } from './RobotAccountList';

export const RobotAccountCard = ({ resource }) => {
  const result = useAsync(() => countRobotAccounts({ resource: resource.url }));
  if (!result.value) {
    return null;
  }
  return <RobotAccountList resource={resource} />;
};
