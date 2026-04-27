import { FC, useMemo } from 'react';
import { RobotAccountDetails, SshKey } from 'waldur-js-client';

import { CopyToClipboardContainer } from '@/core/CopyToClipboardContainer';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const RobotAccountExpandable: FC<{ row: RobotAccountDetails }> = ({
  row,
}) => {
  const groupedKeys = useMemo<Record<string, SshKey[]>>(() => {
    const groups = {};
    row.user_keys.forEach((key) => {
      if (!groups[key.user_uuid]) {
        groups[key.user_uuid] = [];
      }
      groups[key.user_uuid].push(key);
    });
    return groups;
  }, [row]);
  return (
    <ExpandableContainer>
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
    </ExpandableContainer>
  );
};
