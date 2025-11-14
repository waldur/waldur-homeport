import { FC } from 'react';
import {
  OnboardingQuestionMetadata,
  onboardingQuestionMetadataList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OnboardingQuestionMappingCreateButton } from './OnboardingQuestionMappingCreateButton';
import { OnboardingQuestionMetadataActions } from './OnboardingQuestionMetadataActions';

export const OnboardingChecklistQuestionsMappingsList: FC = () => {
  const tableProps = useTable({
    table: 'OnboardingChecklistQuestionsMappings',
    fetchData: createFetcher(onboardingQuestionMetadataList),
    queryField: 'question_description',
  });

  return (
    <Table<OnboardingQuestionMetadata>
      {...tableProps}
      columns={[
        {
          title: translate('Checklist'),
          render: ({ row }) => row.checklist_name,
        },
        {
          title: translate('Question'),
          render: ({ row }) => row.question_description,
        },
        {
          title: translate('Customer field'),
          render: ({ row }) => (
            <span>
              {row.maps_to_customer_field ? (
                <code className="text-primary">
                  {row.maps_to_customer_field}
                </code>
              ) : (
                renderFieldOrDash(null)
              )}
            </span>
          ),
        },
        {
          title: translate('Intent field'),
          render: ({ row }) => (
            <span>
              {row.intent_field ? (
                <code className="text-info">{row.intent_field}</code>
              ) : (
                renderFieldOrDash(null)
              )}
            </span>
          ),
        },
      ]}
      verboseName={translate('Question metadata mappings')}
      hasQuery
      showPageSizeSelector
      tableActions={
        <OnboardingQuestionMappingCreateButton refetch={tableProps.fetch} />
      }
      rowActions={OnboardingQuestionMetadataActions}
    />
  );
};
