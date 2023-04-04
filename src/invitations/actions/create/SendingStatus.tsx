import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Invitation } from '@waldur/invitations/types';

export const SendingStatus = ({ result }: { result: Invitation }) => {
  return (
    <>
      <h2 className="mb-6">{translate('Sending status')}</h2>
      <p>
        {translate('Status')}: {translate('Completed')}
      </p>
      <p>
        {translate('Sender')}: {result?.created_by_full_name}
      </p>
      <p>
        {translate('Date')}: {formatDateTime(result?.created)}
      </p>
      <p>
        {translate('Expires')}: {formatDateTime(result?.expires)}
      </p>
    </>
  );
};
