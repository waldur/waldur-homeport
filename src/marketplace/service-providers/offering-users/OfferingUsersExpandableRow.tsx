import { useQuery } from '@tanstack/react-query';
import {
  marketplaceOfferingUsersChecklistRetrieve,
  marketplaceOfferingUsersPosixAllocationsList,
  marketplaceOfferingUsersPosixGroupsList,
  marketplaceUserOfferingConsentsList,
  OfferingUser,
  QuestionWithAnswer,
} from 'waldur-js-client';

import { Badge, PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { TruncatedDescription } from '@/core/TruncatedDescription';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getMissingAttributeLabels } from '@/marketplace/offerings/details/OfferingUserDetailsDialog';
import {
  isProviderBacked,
  ProviderAccountButton,
} from '@/marketplace/service-providers/accounts/ProviderAccountLink';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { BooleanIconBadge } from '@/project/metadata/BooleanIconBadge';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { propVal } from '@/property/propertyFields';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AnswerRowActions } from './AnswerRowActions';

export const PosixGroupsTable = ({
  offeringUser,
}: {
  offeringUser: OfferingUser;
}) => {
  const tableProps = useTable({
    table: 'offeringUserPosixGroups-' + offeringUser.uuid,
    fetchData: createFetcher(marketplaceOfferingUsersPosixGroupsList, {
      path: { uuid: offeringUser.uuid },
    }),
  });
  return (
    <Table
      {...tableProps}
      // The endpoint sends the few entries whole.
      hasPagination={false}
      columns={[
        {
          title: translate('GID'),
          render: ({ row }) => row.gid,
          copyField: (row) => String(row.gid),
        },
        {
          // A provider project group is shared by all offerings of the
          // provider; the others belong to this offering.
          title: translate('Group'),
          render: ({ row }) =>
            row.kind === 'provider_project_group' ? (
              <span className="inline-flex items-center gap-1.5">
                {row.group_name ? <code>{row.group_name}</code> : null}
                <Badge variant="primary" tone="outline">
                  {translate('Service provider group')}
                </Badge>
              </span>
            ) : (
              <Badge variant="neutral" tone="outline">
                {translate('Offering group')}
              </Badge>
            ),
        },
        {
          title: translate('Organization'),
          render: ({ row }) => renderFieldOrDash(row.customer_name),
        },
        {
          title: translate('Project'),
          render: ({ row }) =>
            row.project_accessible && row.project_uuid ? (
              <Link
                state="project.dashboard"
                params={{ uuid: row.project_uuid }}
                label={row.project_name}
              />
            ) : (
              renderFieldOrDash(row.project_name)
            ),
        },
        {
          title: translate('Offering'),
          render: ({ row }) => renderFieldOrDash(row.offering_name),
        },
      ]}
      title={translate('Project group GIDs')}
      verboseName={translate('Project group GIDs')}
      hideIfEmpty
      hideRefresh
      className="mt-5.5"
      headerClassName="min-h-[40px] py-0"
      titleClassName="h4 font-medium text-secondary"
      minHeight="auto"
    />
  );
};

const POSIX_NAMESPACE_LABELS = {
  uid: () => translate('UID'),
  gid: () => translate('GID'),
};

const POSIX_SCOPE_LABELS = {
  offering: () => translate('Offering'),
  service_provider: () => translate('Service provider'),
};

const PosixIdentifiersTable = ({
  offeringUser,
}: {
  offeringUser: OfferingUser;
}) => {
  const tableProps = useTable({
    table: 'offeringUserPosixAllocations-' + offeringUser.uuid,
    fetchData: createFetcher(marketplaceOfferingUsersPosixAllocationsList, {
      path: { uuid: offeringUser.uuid },
    }),
  });
  return (
    <Table
      {...tableProps}
      // The endpoint sends the few entries whole.
      hasPagination={false}
      columns={[
        {
          title: translate('Identifier'),
          render: ({ row }) =>
            POSIX_NAMESPACE_LABELS[row.namespace]?.() ??
            renderFieldOrDash(row.namespace),
        },
        {
          title: translate('Value'),
          render: ({ row }) => row.value,
          copyField: (row) => String(row.value),
        },
        {
          title: translate('Pool scope'),
          render: ({ row }) =>
            row.pool_uuid
              ? [POSIX_SCOPE_LABELS[row.scope]?.() ?? row.scope, row.scope_name]
                  .filter(Boolean)
                  .join(': ')
              : renderFieldOrDash(null),
        },
        {
          // The value belongs to the user within the pool, not to this account:
          // every offering listed here hands the user the very same number.
          title: translate('Shared with'),
          render: ({ row }) =>
            row.shared_with_offerings?.length
              ? row.shared_with_offerings
                  .map((offering) => offering.name)
                  .join(', ')
              : renderFieldOrDash(null),
        },
      ]}
      title={translate('POSIX identifiers')}
      verboseName={translate('POSIX identifiers')}
      hideIfEmpty
      hideRefresh
      className="mt-5.5"
      headerClassName="min-h-[40px] py-0"
      titleClassName="h4 font-medium text-secondary"
      minHeight="auto"
    />
  );
};

export const OfferingUsersExpandableRow = ({
  row: offeringUser,
}: {
  row: OfferingUser;
}) => {
  const tableProps = useTable({
    table: 'offeringUserChecklist-' + offeringUser.uuid,
    fetchData: createFetcher(marketplaceOfferingUsersChecklistRetrieve, {
      path: { uuid: offeringUser.uuid },
      parser: (data) => data?.questions,
    }),
  });

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const showTosFields = isFeatureVisible(MarketplaceFeatures.display_user_tos);

  // Fetch consent details when the row is expanded
  // Fetch for users with consent or who may have revoked consent
  const { data: consentData, isLoading: isLoadingConsent } = useQuery({
    queryKey: [
      'offeringUserConsent',
      offeringUser.user_uuid,
      offeringUser.offering_uuid,
    ],
    queryFn: async () => {
      const response = await marketplaceUserOfferingConsentsList({
        query: {
          user_uuid: offeringUser.user_uuid,
          offering_uuid: offeringUser.offering_uuid,
          page_size: 1,
          o: ['-modified'], // Get the most recent consent record
        },
      });
      return response.data?.[0] || null;
    },
    enabled: showTosFields,
  });

  const consent = consentData;

  const showPosix = isFeatureVisible(MarketplaceFeatures.show_posix_id_pools);

  return (
    <ExpandableContainer>
      {isProviderBacked(offeringUser) && (
        <div className="flex flex-wrap items-baseline gap-2 mb-1 text-sm">
          <span className="font-medium text-secondary max-w-[175px] sm:w-3/12">
            {translate('Provider account')}:
          </span>
          <span className="text-quaternary flex-1">
            {renderFieldOrDash(offeringUser.service_provider_account_username)}{' '}
            <ProviderAccountButton row={offeringUser} />
          </span>
        </div>
      )}
      {showPosix && <PosixIdentifiersTable offeringUser={offeringUser} />}
      {showPosix && <PosixGroupsTable offeringUser={offeringUser} />}
      <PropertyList
        variant="summary"
        labelClass="max-w-[175px]"
        hideIfEmpty={false}
      >
        {showTosFields && (
          <>
            <PropertyItem
              label={translate('ToS version')}
              value={
                isLoadingConsent ? (
                  <LoadingSpinnerSimple />
                ) : (
                  renderFieldOrDash(consent?.version)
                )
              }
            />
            <PropertyItem
              label={translate('ToS consent date')}
              value={
                isLoadingConsent ? (
                  <LoadingSpinnerSimple />
                ) : (
                  renderFieldOrDash(
                    consent?.agreement_date
                      ? formatDateTime(consent.agreement_date)
                      : null,
                  )
                )
              }
            />
            <PropertyItem
              label={translate('ToS revocation date')}
              value={propVal.date(consent?.revocation_date, {
                precision: 'datetime',
              })}
              hideIfEmpty
            />
          </>
        )}
        <PropertyItem
          label={translate('Comment')}
          value={
            offeringUser.service_provider_comment ? (
              <TruncatedDescription
                text={offeringUser.service_provider_comment}
                max={550}
              />
            ) : null
          }
          className="align-baseline"
          placeholder="N/A"
          hideIfEmpty={false}
        />
        <PropertyItem
          label={translate('Comment URL')}
          value={offeringUser.service_provider_comment_url}
          hideIfEmpty={false}
        />
        {ENV.plugins.WALDUR_CORE.ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS && (
          <>
            <PropertyItem
              label={translate('Profile status')}
              value={propVal.boolean(offeringUser.is_profile_complete, {
                wording: [translate('Complete'), translate('Incomplete')],
              })}
            />
            <PropertyItem
              label={translate('Missing attributes')}
              value={propVal.list(
                getMissingAttributeLabels(
                  offeringUser.missing_profile_attributes,
                ),
              )}
              hideIfEmpty
            />
          </>
        )}
      </PropertyList>
      <Table<QuestionWithAnswer>
        {...tableProps}
        // The endpoint sends the few entries whole.
        hasPagination={false}
        columns={[
          {
            title: translate('Question'),
            render: ({ row }) => row.description,
          },
          {
            title: translate('Answer'),
            render: ({ row }) => (
              <ParsedAnswer
                question={row as any}
                answer={row.existing_answer as any}
              />
            ),
          },
          showExperimentalUiComponents && {
            title: translate('Needs review'),
            render: () => <BooleanIconBadge value={false} />, // Not available atm
          },
        ]}
        title={translate('Compliance metadata')}
        verboseName={translate('Answers')}
        hideIfEmpty
        hideRefresh
        className="mt-5.5"
        headerClassName="min-h-[40px] py-0"
        titleClassName="h4 font-medium text-secondary"
        minHeight="auto"
        rowActions={
          showExperimentalUiComponents
            ? ({ row }) => (
                <AnswerRowActions
                  row={row}
                  offeringUserUuid={offeringUser.uuid}
                  question={row}
                  fetch={fetch}
                />
              )
            : undefined
        }
      />
    </ExpandableContainer>
  );
};
