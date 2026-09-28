import { FC } from 'react';
import {
  rancherServicesDestroy,
  rancherServicesYamlRetrieve,
  rancherServicesYamlUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceDeleteButton } from '@/resource/actions/ResourceDeleteButton';

import { ViewYAMLButton } from './ViewYAMLButton';

export const ServiceActions: FC<{ row; fetch }> = ({ row, fetch }) => {
  return (
    <div className="d-flex gap-2">
      <ViewYAMLButton
        yamlRetrieve={rancherServicesYamlRetrieve}
        yamlUpdate={rancherServicesYamlUpdate}
        resource={row}
      />

      <ResourceDeleteButton
        apiFunction={() => rancherServicesDestroy({ path: { uuid: row.uuid } })}
        resourceType={translate('Service')}
        refetch={fetch}
      />
    </div>
  );
};
