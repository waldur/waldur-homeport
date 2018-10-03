import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { AllocationForm } from '@waldur/slurm/AllocationForm';

registerOfferingType({
  type: 'SlurmInvoices.SlurmPackage',
  get label() {
    return translate('SLURM allocation');
  },
  component: AllocationForm,
});
