import { required } from '@/core/validators';
import { translate } from '@/i18n';
import {
  AdditionalConfigurationStep,
  DetailsOverviewStep,
  FinalConfigurationStep,
  PlanStep,
} from '@/marketplace/deploy/steps/constants';
import { OfferingConfigurationFormStep } from '@/marketplace/deploy/types';

import { FormLonghornStep } from './FormLonghornStep';
import { ManagedFormNodesStep } from './ManagedFormNodesStep';
import { ManagedFormOpenStackOfferingStep } from './ManagedFormOpenStackOfferingStep';
import { rancherClusterName } from './utils';

export const managedDeployOfferingSteps: OfferingConfigurationFormStep[] = [
  DetailsOverviewStep,
  PlanStep,
  {
    label: translate('OpenStack offering'),
    id: 'step-openstack-offerings',
    fields: ['attributes.openstack_offerings'],
    required: true,
    requiredFields: ['attributes.openstack_offerings'],
    component: ManagedFormOpenStackOfferingStep,
  },
  {
    label: translate('Worker nodes hardware configuration'),
    id: 'step-nodes',
    fields: [
      'attributes.worker_nodes_count',
      'attributes.worker_nodes_flavor',
      'attributes.worker_nodes_data_volume_size',
      'attributes.worker_nodes_data_volume_type_name',
      'attributes.worker_nodes_longhorn_volume_size',
      'attributes.worker_nodes_longhorn_volume_type_name',
    ],
    required: true,
    component: ManagedFormNodesStep,
  },
  {
    label: translate('Longhorn'),
    id: 'step-longhorn',
    fields: ['attributes.install_longhorn'],
    required: false,
    component: FormLonghornStep,
  },
  AdditionalConfigurationStep,
  {
    ...FinalConfigurationStep,
    params: {
      nameLabel: translate('Cluster name'),
      nameValidate: [required, rancherClusterName],
    },
  },
];
