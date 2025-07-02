import { FC } from 'react';
import {
  rancherIngressesDestroy,
  rancherIngressesYamlRetrieve,
  rancherIngressesYamlUpdate,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ResourceDeleteButton } from '@waldur/resource/actions/ResourceDeleteButton';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

import { ViewYAMLButton } from './ViewYAMLButton';

export const IngressActions: FC<{ row; fetch }> = ({ row, fetch }) => {
  return (
    <ActionsDropdownComponent>
      <ViewYAMLButton
        yamlRetrieve={rancherIngressesYamlRetrieve}
        yamlUpdate={rancherIngressesYamlUpdate}
        resource={row}
      />

      <ResourceDeleteButton
        apiFunction={() =>
          rancherIngressesDestroy({ path: { uuid: row.uuid } })
        }
        resourceType={translate('Ingress')}
        refetch={fetch}
      />
    </ActionsDropdownComponent>
  );
};
