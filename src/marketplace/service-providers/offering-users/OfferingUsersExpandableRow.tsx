import { useQuery } from '@tanstack/react-query';
import {
  marketplaceOfferingUsersChecklistRetrieve,
  marketplaceUserOfferingConsentsList,
  OfferingUser,
  QuestionWithAnswer,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { TruncatedDescription } from '@/core/TruncatedDescription';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { FIELD_MAPPING } from '@/marketplace/offerings/details/OfferingUserDetailsDialog';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { BooleanIconBadge } from '@/project/metadata/BooleanIconBadge';
import { ParsedAnswer } from '@/project/metadata/ParsedAnswer';
import { Field } from '@/resource/summary';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AnswerRowActions } from './AnswerRowActions';

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

  return (
    <ExpandableContainer>
      {showTosFields && (
        <>
          <Field
            label={translate('ToS version')}
            value={
              isLoadingConsent ? (
                <LoadingSpinnerSimple />
              ) : (
                renderFieldOrDash(consent?.version)
              )
            }
            labelClass="mw-175px"
          />
          <Field
            label={translate('ToS consent date')}
            value={
              isLoadingConsent ? (
                <LoadingSpinnerSimple />
              ) : consent?.agreement_date ? (
                formatDateTime(consent.agreement_date)
              ) : (
                'N/A'
              )
            }
            labelClass="mw-175px"
          />
          {consent?.revocation_date && (
            <Field
              label={translate('ToS revocation date')}
              value={formatDateTime(consent.revocation_date)}
              labelClass="mw-175px"
            />
          )}
        </>
      )}

      <Field
        label={translate('Comment')}
        value={
          offeringUser.service_provider_comment ? (
            <TruncatedDescription
              text={offeringUser.service_provider_comment}
              max={550}
            />
          ) : (
            'N/A'
          )
        }
        labelClass="mw-175px"
        className="align-baseline"
      />

      <Field
        label={translate('Comment URL')}
        value={renderFieldOrDash(offeringUser.service_provider_comment_url)}
        labelClass="mw-175px"
      />

      {ENV.plugins.WALDUR_CORE.ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS && (
        <>
          <Field
            label={translate('Profile status')}
            value={
              offeringUser.is_profile_complete
                ? translate('Complete')
                : translate('Incomplete')
            }
            labelClass="mw-175px"
          />
          {offeringUser.missing_profile_attributes?.length > 0 && (
            <Field
              label={translate('Missing attributes')}
              value={offeringUser.missing_profile_attributes
                .map((key) => {
                  const mapping = FIELD_MAPPING[key];
                  return mapping
                    ? mapping.label()
                    : key
                        .replace(/_/g, ' ')
                        .replace(/^\w/, (c) => c.toUpperCase());
                })
                .join(', ')}
              labelClass="mw-175px"
            />
          )}
        </>
      )}

      <Table<QuestionWithAnswer>
        {...tableProps}
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
        ].filter(Boolean)}
        title={translate('Compliance metadata')}
        verboseName={translate('Answers')}
        hideIfEmpty
        hideRefresh
        className="mt-7"
        headerClassName="min-h-40px py-0"
        titleClassName="h4 fw-bold text-gray-700"
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
