import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

export const OrderTypeCell = ({ row }) =>
  renderFieldOrDash(
    {
      Create: translate('Create'),
      Update: translate('Update'),
      Terminate: translate('Terminate'),
      Restore: translate('Restore'),
    }[row.type],
  );
