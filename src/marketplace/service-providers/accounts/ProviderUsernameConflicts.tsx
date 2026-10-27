import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useEffect } from 'react';
import {
  marketplaceServiceProvidersUsernameConflictsList,
  ProviderUsernameConflict,
  ServiceProvider,
} from 'waldur-js-client';

import { BaseButton, ModalBody, ModalTitle } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { candidateEvidence } from './candidateEvidence';

const AdoptProviderAccountsDialog = lazyComponent(() =>
  import('./AdoptProviderAccountsDialog').then((module) => ({
    default: module.AdoptProviderAccountsDialog,
  })),
);

const NO_CONFLICTS: ProviderUsernameConflict[] = [];

interface ProviderUsernameConflictsProps {
  provider: ServiceProvider;
}

// The full explanation opens in a dialog, as on the account settings page:
// one line under the title and a Show more link to the rest.
const UsernameConflictsIntroDialog: FC = () => (
  <ModalBody>
    <ModalTitle as="h5" className="mb-2.5 text-[15px] leading-[1.555]">
      {translate('Username conflicts')}
    </ModalTitle>
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
  </ModalBody>
);

const renderCandidates = (conflict: ProviderUsernameConflict) => (
  <ul className="list-unstyled mb-0">
    {conflict.candidates.map((candidate) => (
      <li key={candidate.username}>
        <strong>{candidate.username}</strong>{' '}
        <span className="text-quaternary">
          {candidateEvidence(candidate).join(' · ')}
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
  // Every conflict, fetched once: the table pages through them, and the
  // dialog that resolves them gets them all.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ProviderUsernameConflicts', provider.uuid],
    queryFn: () =>
      marketplaceServiceProvidersUsernameConflictsList({
        path: { uuid: provider.uuid },
      }).then((response) => response.data),
  });
  const conflicts = data ?? NO_CONFLICTS;
  const tableProps = useTable({
    table: `provider-username-conflicts-${provider.uuid}`,
    fetchData: createClientPaginatedFetcher(conflicts),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [data]);
  // Only Refresh and Retry (force) download the list again; paging, sorting
  // and search page the rows already held. Memoized: Table fetches again
  // whenever this changes identity, so an inline function refetches on
  // every render.
  const fetch = useCallback(
    (force?: boolean) => {
      if (force) {
        refetch();
      } else {
        tableProps.fetch();
      }
    },
    [refetch, tableProps.fetch],
  );
  const { openDialog } = useModal();

  return (
    <Table<ProviderUsernameConflict>
      {...tableProps}
      loading={isLoading || tableProps.loading}
      error={error || tableProps.error}
      fetch={fetch}
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
        conflicts.length > 0 && (
          <BaseButton
            label={translate('Resolve conflicts')}
            onClick={() =>
              openDialog(AdoptProviderAccountsDialog, {
                resolve: {
                  provider,
                  conflicts,
                  refetch,
                },
              })
            }
            variant="tertiary"
            size="lg"
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
