import { QueryFunction } from 'react-query';

import { fixURL, getFirst } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { parseResponse } from '@waldur/table/api';

import { ResourcesSection } from '../ResourcesSection';
import { DataPage } from '../types';

export const InstancesSection = ({ resource, title }) => {
  const loadData: QueryFunction<DataPage> = async (context) => {
    const service_settings_uuid: string = (
      await getFirst('/service-settings/', {
        scope: resource.url,
      })
    )['uuid'];
    const response = await parseResponse(
      fixURL('/openstacktenant-instances/'),
      {
        service_settings_uuid,
        page: context.pageParam,
      },
      { signal: context.signal },
    );
    return {
      data: response.rows.map((instance) => ({
        name: instance.name,
        summary: translate('Flavor: {flavor_name}, image: {image_name}', {
          flavor_name: instance.flavor_name,
          image_name: instance.image_name,
        }),
        state: instance.state,
        marketplace_resource_uuid: instance.marketplace_resource_uuid,
        project_uuid: instance.project_uuid,
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesSection
      title={title}
      loadData={loadData}
      queryKey="instances"
      canAdd={true}
    />
  );
};
