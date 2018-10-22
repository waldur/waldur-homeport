import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { Attribute } from '@waldur/marketplace/types';
import { AllocationForm } from '@waldur/slurm/AllocationForm';

const ServiceSettingsAttributes = (): Attribute[] => [
  {
    key: 'batch_service',
    title: translate('Batch service'),
    type: 'string',
  },
  {
    key: 'hostname',
    title: translate('Hostname'),
    type: 'string',
  },
  {
    key: 'username',
    title: translate('Username'),
    type: 'string',
  },
  {
    key: 'port',
    title: translate('Port'),
    type: 'string',
  },
  {
    key: 'gateway',
    title: translate('Gateway'),
    type: 'string',
  },
  {
    key: 'use_sudo',
    title: translate('Use sudo'),
    type: 'string',
  },
  {
    key: 'default_account',
    title: translate('Default account'),
    type: 'string',
  },
];

registerOfferingType({
  type: 'SlurmInvoices.SlurmPackage',
  get label() {
    return translate('SLURM allocation');
  },
  component: AllocationForm,
  providerType: 'SLURM',
  attributes: ServiceSettingsAttributes,
});
