import { FC, useMemo } from 'react';
import { RobotAccountDetails, SshKey } from 'waldur-js-client';

import { CodeLine } from '@/core/CodeLine';
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
                            <CodeLine variant="inline" copyable>
                              {key.fingerprint_md5}
                            </CodeLine>
                          </p>
                          <p>
                            {translate('Fingerprint (SHA256)')}:{' '}
                            <CodeLine variant="inline" copyable>
                              {key.fingerprint_sha256}
                            </CodeLine>
                          </p>
                          <p>
                            {translate('Fingerprint (SHA512)')}:{' '}
                            <CodeLine variant="inline" copyable>
                              {key.fingerprint_sha512}
                            </CodeLine>
                          </p>
                          <p>
                            {translate('Public key')}:{' '}
                            <CodeLine variant="inline" copyable>
                              {key.public_key}
                            </CodeLine>
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
                  <CodeLine variant="inline" copyable>
                    {value.md5}
                  </CodeLine>
                </p>
                <p>
                  {translate('Fingerprint (SHA256)')}:{' '}
                  <CodeLine variant="inline" copyable>
                    {value.sha256}
                  </CodeLine>
                </p>
                <p>
                  {translate('Fingerprint (SHA512)')}:{' '}
                  <CodeLine variant="inline" copyable>
                    {value.sha512}
                  </CodeLine>
                </p>
                <p>
                  {translate('Public key')}:{' '}
                  <CodeLine variant="inline" copyable>
                    {row.keys[index]}
                  </CodeLine>
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </ExpandableContainer>
  );
};
