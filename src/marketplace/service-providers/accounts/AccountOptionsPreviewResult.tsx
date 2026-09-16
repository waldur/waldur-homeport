import { FC } from 'react';
import {
  AccountOptionsPreview,
  AccountRename,
  OfferingAccountPreview,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const SETTING_LABELS = {
  account_scope: () => translate('Account scope'),
  username_generation_policy: () => translate('Username generation policy'),
  username_anonymized_prefix: () => translate('Anonymized username prefix'),
  homedir_prefix: () => translate('Home directory prefix'),
  login_shell: () => translate('Login shell'),
};

const RenamesTable: FC<{ offering: OfferingAccountPreview }> = ({
  offering,
}) => {
  const rows = offering.renames;
  const tableProps = useTable({
    table: `account-options-preview-renames-${offering.uuid}`,
    fetchData: () => Promise.resolve({ rows, resultCount: rows.length }),
  });
  return (
    <Table<AccountRename>
      {...tableProps}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
      verboseName={translate('renames')}
      columns={[
        {
          title: translate('Username'),
          render: ({ row }) => renderFieldOrDash(row.username),
        },
        {
          title: translate('New username'),
          render: ({ row }) =>
            row.new_username === null
              ? translate('Allocated with a new UID')
              : renderFieldOrDash(row.new_username),
        },
        {
          title: translate('New home directory'),
          render: ({ row }) => renderFieldOrDash(row.new_home_directory),
        },
      ]}
    />
  );
};

const OfferingPreview: FC<{ offering: OfferingAccountPreview }> = ({
  offering,
}) => (
  <div className="border rounded p-5 mb-4">
    <h5 className="mb-3">{offering.name}</h5>
    {offering.changed.length === 0 ? (
      <p className="text-muted mb-0">
        {translate(
          'Nothing changes: the offering sets these values itself or they stay the same.',
        )}
      </p>
    ) : (
      <>
        <ul className="mb-3">
          {offering.changed.map((name) => {
            const setting = offering.settings[name];
            return (
              <li key={name}>
                {SETTING_LABELS[name]?.() ?? name}:{' '}
                <span className="text-muted">
                  {renderFieldOrDash(setting.before.value)}
                </span>{' '}
                → <strong>{renderFieldOrDash(setting.after.value)}</strong>
              </li>
            );
          })}
        </ul>
        <p className="mb-3">
          {translate(
            'A new person would get {username}, home directory {home} and login shell {shell}.',
            {
              username: offering.example.username || '—',
              home: offering.example.home_directory,
              shell: offering.example.login_shell,
            },
          )}
        </p>
        {offering.provider_accounts_kept > 0 && (
          <p className="text-muted">
            {translate(
              '{count} provider account(s) keep their username, home directory and login shell.',
              { count: offering.provider_accounts_kept },
            )}
          </p>
        )}
        {offering.accounts_keeping_home_or_shell > 0 && (
          <p className="text-muted">
            {translate(
              '{count} existing account(s) keep their home directory and login shell; the change applies to accounts created later.',
              { count: offering.accounts_keeping_home_or_shell },
            )}
          </p>
        )}
        {offering.renames.length > 0 && <RenamesTable offering={offering} />}
      </>
    )}
  </div>
);

/** What a change of the provider's account options would do. */
export const AccountOptionsPreviewResult: FC<{
  preview: AccountOptionsPreview;
}> = ({ preview }) => (
  <>
    {preview.username_conflicts > 0 && (
      <AlertItem
        variant="warning"
        className="mb-4"
        title={translate(
          '{count} person(s) have different usernames on different offerings. Switching to per service provider accounts is refused until they are adopted under Accounts > Username conflicts.',
          { count: preview.username_conflicts },
        )}
      />
    )}
    <p>
      {translate(
        '{renamed} offering account(s) renamed, {kept} provider account(s) unchanged, {homes} account(s) keeping their home directory and login shell.',
        {
          renamed: preview.renamed,
          kept: preview.provider_accounts_kept,
          homes: preview.accounts_keeping_home_or_shell,
        },
      )}
    </p>
    {preview.offerings.map((offering) => (
      <OfferingPreview key={offering.uuid} offering={offering} />
    ))}
  </>
);
