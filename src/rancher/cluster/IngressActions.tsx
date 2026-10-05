import { FC } from 'react';
import {
  rancherIngressesDestroy,
  rancherIngressesYamlRetrieve,
  rancherIngressesYamlUpdate,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { ResourceDeleteButton } from '@/resource/actions/ResourceDeleteButton';
import { ActionsMenu } from '@/table/ActionsDropdown';

import { ViewYAMLButton } from './ViewYAMLButton';

export const IngressActions: FC<{ row; fetch }> = ({ row, fetch }) => {
  return (
    <ActionsMenu>
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
    </ActionsMenu>
  );
};
