import { CopyableValue } from 'waldur-ui';

import { translate } from '@/i18n';

export const IPList = ({ value }) => {
  if (Array.isArray(value) && value.filter(Boolean).length > 0) {
    const ips = value.filter(Boolean);
    return (
      <>
        {ips.map((ip) => (
          <CopyableValue key={ip} value={ip} name={translate('IP address')} />
        ))}
      </>
    );
  }
  return <>–</>;
};
