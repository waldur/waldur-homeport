import { useQuery } from '@tanstack/react-query';
import {
  marketplaceOfferingUsersChecklistRetrieve,
  marketplaceUserOfferingConsentsList,
  OfferingUser,
  QuestionWithAnswer,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { TruncatedDescription } from '@waldur/core/TruncatedDescription';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { BooleanIconBadge } from '@waldur/project/metadata/BooleanIconBadge';
import { ParsedAnswer } from '@waldur/project/metadata/ParsedAnswer';
import { Field } from '@waldur/resource/summary';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
                <LoadingSpinnerIcon />
              ) : (
                consent?.version || 'N/A'
              )
            }
            labelClass="mw-175px"
          />
          <Field
            label={translate('ToS consent date')}
            value={
              isLoadingConsent ? (
                <LoadingSpinnerIcon />
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
        value={offeringUser.service_provider_comment_url || 'N/A'}
        labelClass="mw-175px"
      />

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
