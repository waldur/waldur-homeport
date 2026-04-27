import { formatPhoneNumber } from '@/core/utils';
import { translate } from '@/i18n';

export const CustomerContactColumn = ({ row }) => (
  <>
    {row.email ? (
      <p className="mb-0">{translate('Email: {email}', row)}</p>
    ) : null}
    {row.phone_number ? (
      <p className="mb-0">
        {translate('Phone: {phone_number}', {
          phone_number: formatPhoneNumber(row.phone_number),
        })}
      </p>
    ) : null}
  </>
);
