import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { BaseOrganizationsList } from './BaseOrganizationsList';

export const OrganizationsList = () => {
  const user = useSelector(getUser);
  return <BaseOrganizationsList user={user} standalone />;
};
