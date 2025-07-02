import { FC } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import {
  rancherServicesDestroy,
  rancherServicesYamlRetrieve,
  rancherServicesYamlUpdate,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';

import { ViewYAMLButton } from './ViewYAMLButton';

export const ServiceActions: FC<{ row; fetch }> = ({ row, fetch }) => {
  return (
    <ButtonGroup>
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
    </ButtonGroup>
  );
};
