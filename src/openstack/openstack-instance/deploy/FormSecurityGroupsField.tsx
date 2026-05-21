import { EyeIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-final-form';
import {
  OpenStackSecurityGroup,
  openstackSecurityGroupsList,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableProps } from '@/table/types';
import { useTable } from '@/table/useTable';

const OpenStackSecurityGroupsDialog = lazyComponent(() =>
  import('@/openstack/openstack-security-groups/OpenStackSecurityGroupsDialog').then(
    (module) => ({ default: module.OpenStackSecurityGroupsDialog }),
  ),
);

interface ShowSecurityGroupsButtonProps {
  row: OpenStackSecurityGroup;
}

const ShowSecurityGroupsButton = (props: ShowSecurityGroupsButtonProps) => {
  const { openDialog } = useModal();
  const callback = () => {
    openDialog(OpenStackSecurityGroupsDialog, {
      resolve: { securityGroups: [props.row] },
      size: 'xl',
    });
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
  const { attributes = {} } = useOrderFormData();
  const securityGroups = attributes.security_groups;
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(OpenStackSecurityGroupsDialog, {
      resolve: { securityGroups: securityGroups },
      size: 'xl',
    });
  }, [securityGroups]);

  return (
    <ActionButton
      action={callback}
      disabled={!securityGroups?.length}
      disabledReason={translate('No security groups selected')}
      title={translate('Preview')}
      iconNode={<EyeIcon weight="bold" />}
      className="text-nowrap"
    />
  );
};

interface OwnProps
  extends Pick<FormStepProps, 'offering'>, Partial<TableProps> {}

export const FormSecurityGroupsField = ({ offering, ...props }: OwnProps) => {
  const form = useForm();
  const filter = useMemo(
    () => ({ tenant_uuid: offering.scope_uuid }),
    [offering.scope_uuid],
  );

  // Get the current value from the form state to check if default needs to be set.
  const { attributes = {} } = useOrderFormData();
  const securityGroups = attributes.security_groups;

  useEffect(() => {
    // Pre-fetch and set the default security group only if the field
    // has not been initialized yet (i.e., its value is undefined).
    // This prevents overwriting a user's selection (e.g., an empty array `[]`)
    // on subsequent renders or navigations.
    if (securityGroups !== undefined) {
      return;
    }

    openstackSecurityGroupsList({
      query: {
        tenant_uuid: offering.scope_uuid,
        name: 'default',
        page_size: 1,
      },
    })
      .then((response) => response.data)
      .then((defaultGroupList) => {
        // If a default group is found, set it as the form value.
        // Otherwise, initialize with an empty array to mark the field as initialized.
        const valueToSet =
          defaultGroupList && defaultGroupList.length > 0
            ? defaultGroupList
            : [];
        form.change('attributes.security_groups', valueToSet);
      })
      .catch(() => {
        // In case of an error, initialize with an empty array
        // to avoid repeated attempts on subsequent renders.
        form.change('attributes.security_groups', []);
      });
  }, [offering.scope_uuid, form, securityGroups]);

  const tableProps = useTable({
    table: 'deploy-security-groups',
    fetchData: createFetcher(openstackSecurityGroupsList),
    queryField: 'name',
    filter,
    staleTime: UI_STALE_TIME,
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
