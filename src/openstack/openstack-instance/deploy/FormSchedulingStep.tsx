import { XIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  OpenStackServerGroup,
  openstackServerGroupsList,
} from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { ActionButton } from '@waldur/table/ActionButton';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

const policyTooltips: Record<string, string> = {
  affinity: translate(
    'All instances in this group are placed on the same physical host.',
  ),
  'anti-affinity': translate(
    'Instances in this group are placed on different physical hosts.',
  ),
  'soft-affinity': translate(
    'Instances are placed on the same host if possible, but not guaranteed.',
  ),
  'soft-anti-affinity': translate(
    'Instances are spread across hosts if possible, but not guaranteed.',
  ),
};

export const FormSchedulingStep = (props: FormStepProps) => {
  const filter = useMemo(
    () => ({ tenant_uuid: props.offering.scope_uuid }),
    [props.offering.scope_uuid],
  );

  const tableProps = useTable({
    table: 'deploy-server-groups',
    fetchData: createFetcher(openstackServerGroupsList),
    queryField: 'name',
    filter,
    staleTime: 3 * 60 * 1000,
  });

  const serverGroup = useSelector((state) =>
    orderFormSelector(state, 'attributes.server_group'),
  );

  const clearSelection = useCallback(() => {
    props.change('attributes.server_group', undefined);
  }, [props.change]);

  if (!tableProps.loading && tableProps.rows?.length === 0) {
    return null;
  }

  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
      <AccordionCard
        title={translate('Scheduling')}
        subtitle={translate(
          'Server groups control how instances are placed on physical hosts.',
        )}
        id={props.id}
        className={classNames('step-card', props.disabled && 'step-disabled')}
      >
        <Table<OpenStackServerGroup>
          {...tableProps}
          className="mt-n4"
          columns={[
            {
              title: translate('Name'),
              render: ({ row }) => row.name,
            },
            {
              title: translate('Policy'),
              render: ({ row }) => {
                if (!row.policy) return DASH_ESCAPE_CODE;
                const tooltip = policyTooltips[row.policy];
                return tooltip ? (
                  <Tip id={`policy-${row.uuid}`} label={tooltip}>
                    <span style={{ borderBottom: '1px dotted currentColor' }}>
                      {row.policy}
                    </span>
                  </Tip>
                ) : (
                  row.policy
                );
              },
            },
          ]}
          title={translate('Server group')}
          verboseName={translate('server groups')}
          tableActions={
            serverGroup ? (
              <ActionButton
                action={clearSelection}
                title={translate('Clear')}
                iconNode={<XIcon weight="bold" />}
                variant="text-primary"
              />
            ) : null
          }
          hoverable
          fieldType="radio"
          fieldName="attributes.server_group"
          cardBordered={false}
          minHeight="auto"
          headerClassName="mx-0"
          titleClassName="fs-6 text-gray-700"
        />
      </AccordionCard>
    </Tip>
  );
};
