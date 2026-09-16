import { FC } from 'react';
import {
  marketplaceServiceProvidersUsernameConflictsList,
  ProviderUsernameConflict,
  ServiceProvider,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

const AdoptProviderAccountsDialog = lazyComponent(() =>
  import('./AdoptProviderAccountsDialog').then((module) => ({
    default: module.AdoptProviderAccountsDialog,
  })),
);

interface ProviderUsernameConflictsProps {
  provider: ServiceProvider;
}

// The full explanation opens in a dialog, as on the account settings page:
// one line under the title and a Show more link to the rest.
const UsernameConflictsIntroDialog: FC = () => (
  <div className="modal-header-less">
    <div className="modal-body">
      <h5 className="modal-title mb-3">{translate('Username conflicts')}</h5>
      <p>
        {translate(
          'A conflict is a person who has different usernames on different offerings of this service provider, for example because the offerings generate usernames differently.',
        )}
      </p>
      <p>
        {translate(
          'It matters once offerings share accounts. With accounts per service provider, a person has one account, with one username, POSIX UID and home directory, on all of them, so one of the usernames has to be kept. Until then, switching the account scope to per service provider is refused.',
        )}
      </p>
      <p className="mb-0">
        {translate(
          'Resolve conflicts lets you choose that username for each person. Their accounts on the other offerings are renamed to it and take over its POSIX UID and home directory. People whose usernames already agree need no choice.',
        )}
      </p>
    </div>
  </div>
);

const renderCandidates = (conflict: ProviderUsernameConflict) => (
  <ul className="list-unstyled mb-0">
    {conflict.candidates.map((candidate) => (
      <li key={candidate.username}>
        <strong>{candidate.username}</strong>{' '}
        <span className="text-muted">
          {translate('used on {count} offering(s)', {
            count: candidate.offering_count,
          })}
          {candidate.has_active_resources
            ? ` · ${translate('has active resources')}`
            : ''}
          {candidate.home_directories.length
            ? ` · ${candidate.home_directories.join(', ')}`
            : ''}
        </span>
      </li>
    ))}
  </ul>
);

/**
 * People whose usernames differ across the provider's offerings. They block
 * switching to one account per person until a surviving username is chosen.
 */
export const ProviderUsernameConflicts: FC<ProviderUsernameConflictsProps> = ({
  provider,
}) => {
  const user = useUser();
  const customer = useCustomer();
  // Resolving is refused by the backend for anyone but owners and staff.
  const canResolve = checkIsOwnerOrStaff(customer, user);
  const tableProps = useTable({
    table: `provider-username-conflicts-${provider.uuid}`,
    fetchData: () =>
      marketplaceServiceProvidersUsernameConflictsList({
        path: { uuid: provider.uuid },
      }).then((response) => ({
        rows: response.data,
        resultCount: response.data.length,
      })),
  });
  const { openDialog } = useModal();

  return (
    <Table<ProviderUsernameConflict>
      {...tableProps}
      title={translate('Username conflicts')}
      subtitle={
        <>
          {translate(
            'People with different usernames on different offerings. They must be resolved before offerings can share accounts.',
          )}{' '}
          <button
            type="button"
            className="text-anchor"
            onClick={() =>
              openDialog(UsernameConflictsIntroDialog, { size: 'lg' })
            }
          >
            {translate('Show more')}
          </button>
        </>
      }
      verboseName={translate('username conflicts')}
      emptyMessage={translate(
        'Every person has the same username on all offerings of this service provider.',
      )}
      placeholderHasRetry={false}
      tableActions={
        canResolve &&
        tableProps.rows.length > 0 && (
          <ActionButton
            title={translate('Resolve conflicts')}
            action={() =>
              openDialog(AdoptProviderAccountsDialog, {
                resolve: {
                  provider,
                  conflicts: tableProps.rows,
                  refetch: tableProps.fetch,
                },
              })
            }
          />
        )
      }
      columns={[
        {
          title: translate('Person'),
          render: ({ row }) => row.user_full_name || row.user_username,
        },
        {
          title: translate('Usernames'),
          render: ({ row }) => renderCandidates(row),
        },
      ]}
    />
  );
};
