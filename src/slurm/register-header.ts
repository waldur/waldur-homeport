import { translate } from '@waldur/i18n';
import * as registry from '@waldur/resource/resource-configuration';

const getHeader = resource =>
  resource.batch_service === 'MOAB'
    ? translate('MOAB allocation')
    : translate('SLURM allocation');

registry.register('SLURM.Allocation', {
  getHeader,
});
