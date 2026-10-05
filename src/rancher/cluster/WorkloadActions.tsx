import { FunctionComponent } from 'react';
import {
  rancherWorkloadsYamlRetrieve,
  rancherWorkloadsYamlUpdate,
} from 'waldur-js-client';

import { ActionsMenu } from '@/table/ActionsDropdown';

import { DeleteWorkloadAction } from './DeleteWorkloadAction';
import { RedeployWorkloadAction } from './RedeployWorkloadAction';
import { ViewYAMLButton } from './ViewYAMLButton';

export const WorkloadActions: FunctionComponent<{ workload }> = ({
  workload,
}) => {
  return (
    <ActionsMenu>
      <ViewYAMLButton
        yamlRetrieve={rancherWorkloadsYamlRetrieve}
        yamlUpdate={rancherWorkloadsYamlUpdate}
        resource={workload}
      />
      <RedeployWorkloadAction workload={workload} />
      <DeleteWorkloadAction workload={workload} />
    </ActionsMenu>
  );
};
