import { translate } from '@/i18n';

export const OrderTypeCell = ({ row }) =>
  ({
    Create: translate('Create'),
    Update: translate('Update'),
    Terminate: translate('Terminate'),
  })[row.type];
