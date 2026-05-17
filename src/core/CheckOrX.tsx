import { translate } from '@/i18n';

export const CheckOrX = ({ value }) =>
  value ? <>{translate('Enabled')}</> : <>{translate('Disabled')}</>;
