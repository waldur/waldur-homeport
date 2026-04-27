import {
  dataAccessLogsDestroy,
  GlobalUserDataAccessLog,
} from 'waldur-js-client';

import { DeleteButton } from '@/core/buttons';
import { formatJsxTemplate, translate } from '@/i18n';

interface DataAccessLogDeleteButtonProps {
  row: GlobalUserDataAccessLog;
  refetch: () => void;
}

export const DataAccessLogDeleteButton = ({
  row,
  refetch,
}: DataAccessLogDeleteButtonProps) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => dataAccessLogsDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the data access log for user {name}?',
        { name: <strong>{r.user.full_name || r.user.username}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove data access log.')}
    title={translate('Remove')}
  />
);
