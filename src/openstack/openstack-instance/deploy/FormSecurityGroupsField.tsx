import { EyeIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

const OpenStackSecurityGroupsDialog = lazyComponent(() =>
  import(
    '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsDialog'
  ).then((module) => ({ default: module.OpenStackSecurityGroupsDialog })),
);

interface ShowSecurityGroupsButtonProps {
  row: OpenStackSecurityGroup;
}

const ShowSecurityGroupsButton = (props: ShowSecurityGroupsButtonProps) => {
  const dispatch = useDispatch();
  const callback = () => {
    dispatch(
      openModalDialog(OpenStackSecurityGroupsDialog, {
        resolve: { securityGroups: [props.row] },
        size: 'xl',
      }),
    );
  };
  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('Show rules')}
        action={callback}
        iconNode={<EyeIcon weight="bold" />}
      />
    </ActionsDropdownComponent>
  );
};

const ShowPreviewButton = () => {
  const securityGroups = useSelector((state) =>
    orderFormSelector(state, 'attributes.security_groups'),
  );
  const dispatch = useDispatch();
  const callback = useCallback(() => {
    dispatch(
      openModalDialog(OpenStackSecurityGroupsDialog, {
        resolve: { securityGroups: securityGroups },
        size: 'xl',
      }),
    );
  }, [securityGroups]);

  return (
    <Button
      variant="outline"
      className="btn-outline-default text-nowrap"
      onClick={callback}
      disabled={!securityGroups?.length}
    >
      <span className="svg-icon svg-icon-2">
        <EyeIcon />
      </span>
      {translate('Preview')}
    </Button>
  );
};

interface OwnProps
  extends Pick<FormStepProps, 'offering' | 'change'>,
    Partial<TableProps> {}

export const FormSecurityGroupsField = ({
  offering,
  change,
  ...props
}: OwnProps) => {
  const filter = useMemo(
    () => ({ tenant_uuid: offering.scope_uuid }),
    [offering.scope_uuid],
  );

  const tableProps = useTable({
    table: 'deploy-security-groups',
    fetchData: createFetcher('openstack-security-groups'),
    onFetch: (rows, _, firstFetch) => {
      if (!firstFetch || !rows?.length) return;
      const defaultItem = rows.find((row) => row?.name === 'default');
      if (defaultItem) {
        change('attributes.security_groups', [defaultItem]);
      }
    },
    queryField: 'name',
    filter,
    staleTime: 3 * 60 * 1000,
  });

  return (
    <Table<OpenStackSecurityGroup>
      {...tableProps}
      columns={[
        {
          title: translate('Security group name'),
          render: ({ row }) => (
            <>
              {row.name}{' '}
              {row.name === 'default' && (
                <Tip
                  label={translate(
                    'Removing default security group can remove egress access from the VM and block communication with Openstack metadata service.',
                  )}
                  id="default_security_group_tooltip"
                >
                  <WarningCircleIcon
                    size={20}
                    weight="bold"
                    className="text-warning"
                  />
                </Tip>
              )}
            </>
          ),
        },
        {
          title: translate('Description'),
          render: ({ row }) => row.description,
        },
      ]}
      title={translate('Security groups')}
      verboseName={translate('Security groups')}
      tableActions={<ShowPreviewButton />}
      rowActions={ShowSecurityGroupsButton}
      hasQuery
      hoverable
      fieldType="checkbox"
      fieldName="attributes.security_groups"
      {...props}
    />
  );
};
