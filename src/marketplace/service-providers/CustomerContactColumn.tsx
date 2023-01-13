import { translate } from '@waldur/i18n';

export const CustomerContactColumn = ({ row }) => (
  <>
    {row.email ? <p>{translate('Email: {email}', row)}</p> : null}
    {row.phone_number ? <p>{translate('Phone: {phone_number}', row)}</p> : null}
  </>
);
