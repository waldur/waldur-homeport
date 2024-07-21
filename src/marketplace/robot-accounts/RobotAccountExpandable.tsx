import { FC, useMemo } from 'react';

import { CopyToClipboardContainer } from '@waldur/core/CopyToClipboardContainer';
import { translate } from '@waldur/i18n';
import { SshKey } from '@waldur/user/types';

import { RobotAccount } from './types';

export const RobotAccountExpandable: FC<{ row: RobotAccount }> = ({ row }) => {
  const groupedKeys = useMemo<Record<string, SshKey[]>>(
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
          <strong>{translate('Connected users and their keys')}</strong>
          <ul>
            {row.users.map((user, index) => (
              <li key={index}>
                {user.full_name} ({user.username})
                {groupedKeys[user.uuid]?.length > 0 && (
                  <p>
                    <ul>
                      {groupedKeys[user.uuid].map((key, index) => (
                        <li key={index}>
                          <p>
                            {translate('Key name')}: {key.name}
                          </p>
                          <p>
                            {translate('Fingerprint (MD5)')}:{' '}
                            <CopyToClipboardContainer
                              value={key.fingerprint_md5}
                            />
                          </p>
                          <p>
                            {translate('Fingerprint (SHA256)')}:{' '}
                            <CopyToClipboardContainer
                              value={key.fingerprint_sha256}
                            />
                          </p>
                          <p>
                            {translate('Fingerprint (SHA512)')}:{' '}
                            <CopyToClipboardContainer
                              value={key.fingerprint_sha512}
                            />
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
      {row.fingerprints.length > 0 ? (
        <>
          <strong>{translate('Robot SSH keys')}</strong>
          <ul>
            {row.fingerprints.map((value, index) => (
              <li key={index}>
                <p>
                  {translate('Fingerprint (MD5)')}:{' '}
                  <CopyToClipboardContainer value={value.md5} />
                </p>
                <p>
                  {translate('Fingerprint (SHA256)')}:{' '}
                  <CopyToClipboardContainer value={value.sha256} />
                </p>
                <p>
                  {translate('Fingerprint (SHA512)')}:{' '}
                  <CopyToClipboardContainer value={value.sha512} />
                </p>
                <p>
                  {translate('Public key')}:{' '}
                  <CopyToClipboardContainer value={row.keys[index]} />
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};
