import { useSelector } from 'react-redux';

import { ServiceAccountsList } from '@/customer/service-accounts/ServiceAccountsList';
import { getProject } from '@/workspace/selectors';

export const ProjectServiceAccountsList = () => {
  const project = useSelector(getProject);
  return <ServiceAccountsList context="project" scope={project} />;
};
