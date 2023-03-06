import { useMemo } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';

export const RobotAccountExpandable = ({ row }) => {
  const groupedKeys = useMemo(
    () =>
      row.user_keys.reduce((result, item) => {
        if (!result[item.user_uuid]) {
          result[item.user_uuid] = [];
        }
        result[item.user_uuid].push(item);
        return result;
      }, {}),
    [row],
  );
  return (
    <>
      {row.users.length > 0 ? (
        <>
          <strong>{translate('Users')}</strong>
          <ul>
            {row.users.map((user, index) => (
              <li key={index}>
                {user.full_name} ({user.username})
                {groupedKeys[user.uuid]?.length > 0 && (
                  <p>
                    <strong>{translate('SSH keys')}</strong>
                    <ul>
                      {groupedKeys[user.uuid].map((key, index) => (
                        <li key={index}>
                          <p>
                            {translate('Name')}: {key.name}
                          </p>
                          <p>
                            {translate('Fingerprint')}:{' '}
                            <CopyToClipboardContainer value={key.fingerprint} />
                          </p>
                          <p>
                            {translate('Public key')}:{' '}
                            <CopyToClipboardContainer value={key.public_key} />
                          </p>
                        </li>
                      ))}
                    </ul>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {row.keys.length > 0 ? (
        <>
          <strong>{translate('SSH keys')}</strong>
          <ul>
            {row.keys.map((key, index) => (
              <li key={index}>
                <p>
                  {translate('Fingerprint')}:{' '}
                  <CopyToClipboardContainer value={key.fingerprint} />
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};
