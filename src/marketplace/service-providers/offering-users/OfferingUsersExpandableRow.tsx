import {
  marketplaceOfferingUsersChecklistRetrieve,
  OfferingUser,
  QuestionWithAnswer,
} from 'waldur-js-client';

import { TruncatedDescription } from '@waldur/core/TruncatedDescription';
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

  return (
    <ExpandableContainer>
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
