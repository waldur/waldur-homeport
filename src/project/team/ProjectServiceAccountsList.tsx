import { useSelector } from 'react-redux';

import { ServiceAccountsList } from '@waldur/customer/service-accounts/ServiceAccountsList';
import { getProject } from '@waldur/workspace/selectors';

export const ProjectServiceAccountsList = () => {
  const project = useSelector(getProject);
  return <ServiceAccountsList context="project" scope={project} />;
};
