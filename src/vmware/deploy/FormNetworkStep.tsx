import { useMemo } from 'react';
import { Button } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const FormNetworkStep = (props: FormStepProps) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;

  const filter = useMemo(
    () => ({
      settings_uuid: props.offering.scope_uuid,
      customer_uuid: props.offering.customer_uuid,
    }),
    [props.offering],
  );

  const tableProps = useTable({
    table: 'deploy-security-groups',
    fetchData: createFetcher('vmware-networks'),
    filter,
    staleTime: 3 * 60 * 1000,
  });

  return (
    <StepCard
      title={translate('Network interfaces')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      actions={
        showExperimentalUiComponents ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <Button variant="light" className="text-nowrap" size="sm">
              <i className="fa fa-plus"></i>
              {translate('New interface')}
            </Button>
          </div>
        ) : null
      }
    >
      {advancedMode && (
        <Table
          {...tableProps}
          columns={[
            {
              title: translate('Network name'),
              render: ({ row }) => row.name,
            },
            {
              title: translate('Type'),
              render: ({ row }) => row.type,
            },
          ]}
          verboseName={translate('Network interfaces')}
          hasActionBar={false}
          fullWidth
          hoverable
          fieldType="checkbox"
          fieldName="attributes.networks"
        />
      )}
    </StepCard>
  );
};
