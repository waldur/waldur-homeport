import { translate } from '@waldur/i18n';

export const OrderItemTypeCell = ({ row }) =>
  ({
    Create: translate('Create'),
    Update: translate('Update'),
    Terminate: translate('Terminate'),
  }[row.type]);
