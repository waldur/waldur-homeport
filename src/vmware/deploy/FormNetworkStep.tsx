import { PlusIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { vmwareNetworksList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { UI_STALE_TIME } from '@/core/constants';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { createFetcher } from '@/table/api';
import { CompactActionButton } from '@/table/CompactActionButton';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

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
    fetchData: createFetcher(vmwareNetworksList),
    filter,
    staleTime: UI_STALE_TIME,
  });

  return (
    <VStepperFormStepCard
      title={translate('Network interfaces')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        showExperimentalUiComponents ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <CompactActionButton
              variant="tertiary"
              className="text-nowrap"
              iconNode={<PlusIcon weight="bold" />}
              title={translate('New interface')}
              action={() => {}}
            />
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
          hoverable
          fieldType="checkbox"
          fieldName="attributes.networks"
        />
      )}
    </VStepperFormStepCard>
  );
};
