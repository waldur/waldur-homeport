import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { checklistsAdminRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinnerSimple } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { FieldEditButton } from './FieldEditButton';
import { StaffOnlyIndicator } from './StaffOnlyIndicator';
import { CustomerEditPanelProps } from './types';

export const CustomerChecklistPanel: FC<CustomerEditPanelProps> = (props) => {
  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['checklistAdmin', props.customer.project_metadata_checklist],
    queryFn: () =>
      props.customer.project_metadata_checklist
        ? checklistsAdminRetrieve({
            path: { uuid: props.customer.project_metadata_checklist },
          }).then((response) => response.data)
        : null,
    staleTime: 3 * 60 * 1000,
  });

  return (
    <FormTable.Card title={translate('Checklist')} className="card-bordered">
      <FormTable>
        <FormTable.Item
          label={translate('Project metadata schema')}
          value={
            props.customer.project_metadata_checklist ? (
              isLoading ? (
                <>
                  {props.customer.project_metadata_checklist}{' '}
                  <LoadingSpinnerSimple />
                </>
              ) : error ? (
                <LoadingErred
                  loadData={refetch}
                  className="d-flex flex-center gap-4"
                />
              ) : data ? (
                <>
                  {data.name}
                  <span className="text-muted ms-2">
                    (
                    {translate('{count} questions', {
                      count: data.questions_count,
                    })}
                    )
                  </span>
                </>
              ) : (
                'N/A'
              )
            ) : (
              'N/A'
            )
          }
          actions={
            props.canUpdate ? (
              <>
                <StaffOnlyIndicator />
                <FieldEditButton
                  customer={props.customer}
                  callback={props.callback}
                  name="project_metadata_checklist"
                />
              </>
            ) : null
          }
        />
      </FormTable>
    </FormTable.Card>
  );
};
