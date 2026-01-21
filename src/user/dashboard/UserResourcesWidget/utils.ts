import { groupBy } from 'lodash-es';
import { Resource, ResourceState } from 'waldur-js-client';

export interface ProjectInfo {
  uuid: string;
  name: string;
  customerName: string;
  customerUuid: string;
  resources: Resource[];
}

export const ACTIVE_RESOURCE_STATES: ResourceState[] = [
  'Creating',
  'OK',
  'Erred',
  'Updating',
  'Terminating',
];

export const groupResourcesByProject = (
  resources: Resource[],
): ProjectInfo[] => {
  const grouped = groupBy(resources, 'project_uuid');

  return Object.entries(grouped).map(([projectUuid, projectResources]) => ({
    uuid: projectUuid,
    name: projectResources[0]?.project_name || '',
    customerName: projectResources[0]?.customer_name || '',
    customerUuid: projectResources[0]?.customer_uuid || '',
    resources: projectResources,
  }));
};
