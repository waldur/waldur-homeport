import { QueryFunction } from 'react-query';

import { fixURL, getFirst } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { getResourceState } from '@waldur/resource/state/utils';
import { parseResponse } from '@waldur/table/api';

import { AddResourceButton } from '../../actions/AddResourceButton';
import { ResourcesList } from '../ResourcesList';
import { DataPage } from '../types';

export const InstancesSection = ({ resource }) => {
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
        state: getResourceState(instance),
        marketplace_resource_uuid: instance.marketplace_resource_uuid,
        project_uuid: instance.project_uuid,
        url: instance.url,
      })),
      nextPage: response.nextPage,
    };
  };
  return (
    <ResourcesList
      loadData={loadData}
      queryKey="instances"
      actions={<AddResourceButton resource={resource} />}
    />
  );
};
