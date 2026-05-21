import { ServiceAccountsList } from '@/customer/service-accounts/ServiceAccountsList';
import { useProject } from '@/workspace/hooks';

export const ProjectServiceAccountsList = () => {
  const project = useProject();
  return <ServiceAccountsList context="project" scope={project} />;
};
