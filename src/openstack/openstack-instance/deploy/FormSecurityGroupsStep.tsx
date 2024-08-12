import { Eye, Plus } from '@phosphor-icons/react';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';
import { Table, createFetcher } from '@waldur/table';
import { RowActionButton } from '@waldur/table/ActionButton';
import { useTable } from '@waldur/table/utils';

const OpenStackSecurityGroupsDialog = lazyComponent(
  () =>
    import(
      '@waldur/openstack/openstack-security-groups/OpenStackSecurityGroupsDialog'
    ),
  'OpenStackSecurityGroupsDialog',
);

interface ShowSecurityGroupsButtonProps {
  row: SecurityGroup;
}

const ShowSecurityGroupsButton = (props: ShowSecurityGroupsButtonProps) => {
  const dispatch = useDispatch();
  const callback = (e) => {
    e.stopPropagation();
    dispatch(
      openModalDialog(OpenStackSecurityGroupsDialog, {
        resolve: { securityGroups: [props.row] },
        size: 'lg',
      }),
    );
  };
  return (
    <RowActionButton
      title={translate('Show rules')}
      iconNode={<Eye />}
      size="sm"
      action={callback}
    />
  );
};

const ShowPreviewButton = () => {
  const securityGroups = useSelector((state) =>
    formValueSelector(ORDER_FORM_ID)(state, 'attributes.security_groups'),
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
      variant="light"
      className="text-nowrap"
      size="sm"
      onClick={callback}
      disabled={!securityGroups?.length}
    >
      {translate('Preview')}
    </Button>
  );
};

export const FormSecurityGroupsStep = (props: FormStepProps) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const [query, setQuery] = useState('');

  const filter = useMemo(
    () => ({
      settings_uuid: props.offering.scope_uuid,
      name: query ? query : undefined,
    }),
    [props.offering, query],
  );

  const tableProps = useTable({
    table: 'deploy-security-groups',
    fetchData: createFetcher('openstacktenant-security-groups'),
    onFetch: (rows, _, firstFetch) => {
      if (!firstFetch || !rows?.length) return;
      const defaultItem = rows.find((row) => row?.name === 'default');
      if (defaultItem) {
        props.change('attributes.security_groups', [defaultItem]);
      }
    },
    filter,
    staleTime: 3 * 60 * 1000,
  });

  const search = useCallback(
    debounce(function (value: string) {
      setQuery(value);
    }, 500),
    [setQuery],
  );

  return (
    <VStepperFormStepCard
      title={translate('Security groups')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
      actions={
        <div className="d-flex justify-content-between flex-grow-1 align-items-center">
          <FormControl
            className="form-control-solid text-center mx-5 mx-lg-8"
            placeholder={translate('Search') + '...'}
            type="text"
            size="sm"
            onChange={(e) => search(e.target.value)}
          />
          <div className="d-flex gap-2">
            <ShowPreviewButton />
            {showExperimentalUiComponents && (
              <Button variant="light" className="text-nowrap" size="sm">
                <span className="svg-icon svg-icon-2">
                  <Plus />
                </span>
                {translate('New security group')}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <Table
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
                    <i
                      className="fa fa-exclamation-triangle"
                      style={{ color: 'red' }}
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
        verboseName={translate('Security groups')}
        hasActionBar={false}
        rowActions={ShowSecurityGroupsButton}
        hoverable
        fieldType="checkbox"
        fieldName="attributes.security_groups"
      />
    </VStepperFormStepCard>
  );
};
