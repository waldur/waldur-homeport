import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { openModalDialog } from '@waldur/modal/actions';
import { SecurityGroup } from '@waldur/openstack/openstack-security-groups/types';
import { Table, createFetcher } from '@waldur/table';
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
    <Button className="ms-2" size="sm" variant="light" onClick={callback}>
      <i className="fa fa-eye" /> {translate('Show rules')}
    </Button>
  );
};

const ShowPreviewButton = () => {
  const securityGroups = useSelector((state) =>
    formValueSelector(FORM_ID)(state, 'attributes.security_groups'),
  );
  const dispatch = useDispatch();
  const callback = useCallback(() => {
    dispatch(
      openModalDialog(OpenStackSecurityGroupsDialog, {
        resolve: { securityGroups: securityGroups },
        size: 'lg',
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
    <StepCard
      title={translate('Security groups')}
      step={props.step}
      id={props.id}
      completed={props.observed}
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
                <i className="fa fa-plus"></i>
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
            render: ({ row }) => row.name,
          },
          {
            title: translate('Description'),
            render: ({ row }) => row.description,
          },
        ]}
        verboseName={translate('Security groups')}
        hasActionBar={false}
        hoverableRow={ShowSecurityGroupsButton}
        fullWidth
        hoverable
        fieldType="checkbox"
        fieldName="attributes.security_groups"
      />
    </StepCard>
  );
};
