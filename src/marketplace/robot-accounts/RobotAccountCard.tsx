import { useQuery } from '@tanstack/react-query';

import { countRobotAccounts } from '@/marketplace/common/api';

import { RobotAccountList } from './RobotAccountList';

export const RobotAccountCard = ({ resource }) => {
  const result = useQuery({
    queryKey: ['RobotAccountCard'],
    queryFn: () => countRobotAccounts({ resource: resource.url }),
  });
  if (!result.data) {
    return null;
  }
  return <RobotAccountList resource={resource} />;
};
