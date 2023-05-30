import { getList } from '@waldur/core/api';
import { Project, Customer } from '@waldur/workspace/types';

export const refreshProjects = async (name: string, customer?: Customer) => {
  if (!customer) {
    return;
  }
  const params: Record<string, string> = {
    customer: customer.uuid,
  };
  if (name) {
    params.name = name;
  }
  const projects = await getList('/projects/', params);
  return { options: projects };
};

export const refetchs = async (name: string, project?: Project) => {
  if (!project) {
    return;
  }

  const params: Record<string, string | string[]> = {
    project_uuid: project.uuid,
    field: ['name', 'url', 'offering_name'],
    o: ['name'],
  };
  if (name) {
    params.name = name;
  }
  const resources = await getList('/marketplace-resources/', params);
  return { options: resources };
};
