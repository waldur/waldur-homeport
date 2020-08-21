import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import {
  change,
  FieldArray,
  formValueSelector,
  arrayRemoveAll,
  arrayPush,
  Field,
} from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Offering } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ClusterTemplate } from '@waldur/rancher/types';

import { NodeList } from './NodeList';
import { SubnetGroup } from './SubnetGroup';
import { loadData } from './utils';

const getTemplate = (state) =>
  formValueSelector(FORM_ID)(state, 'attributes.template');

const NODES_FIELD_ARRAY = 'attributes.nodes';

const SECURITY_GROUPS_FIELD = 'attributes.security_groups';

const filterFlavor = (node, flavor) => {
  if (node.min_ram) {
    if (flavor.ram < node.min_ram * 1024) {
      return false;
    }
  }
  if (node.min_vcpu) {
    if (flavor.cores < node.min_vcpu) {
      return false;
    }
  }
  return true;
};

interface TenantGroupProps {
  tenant: string;
  offering: Offering;
}

export const TenantGroup: React.FC<TenantGroupProps> = (props) => {
  const resourceProps = useAsync(() => loadData(props.tenant, props.offering), [
    props.tenant,
    props.offering,
  ]);

  const dispatch = useDispatch();
  const updateNodesCount = React.useCallback(
    (nodes) => {
      dispatch(change(FORM_ID, 'limits.node', nodes));
    },
    [dispatch],
  );

  const template = useSelector<any, ClusterTemplate>(getTemplate);

  React.useEffect(() => {
    if (!template) {
      return;
    }

    waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate(
        'Are you sure you want to cluster template? Note this will reset the node plan.',
      ),
    ).then(() => {
      dispatch(arrayRemoveAll(FORM_ID, NODES_FIELD_ARRAY));
      for (const node of template.nodes) {
        const flavors = resourceProps.value.flavors.filter((flavor) =>
          filterFlavor(node, flavor),
        );
        const flavor = flavors.length > 0 ? flavors[0] : undefined;
        const preferredVolumeType = node.preferred_volume_type
          ? resourceProps.value.volumeTypes.find(
              (option) => option.name === node.preferred_volume_type,
            )
          : undefined;
        dispatch(
          arrayPush(FORM_ID, NODES_FIELD_ARRAY, {
            roles: node.roles,
            system_volume_size: node.system_volume_size,
            system_volume_type: preferredVolumeType
              ? preferredVolumeType.value
              : undefined,
            flavor,
          }),
        );
      }
      dispatch(change(FORM_ID, 'limits.node', template.nodes.length));
    });
  }, [dispatch, template]);

  // Select default security group initially
  React.useEffect(() => {
    const defaultSecurityGroup = resourceProps.value?.securityGroups.find(
      (group) => group.name === 'default',
    );

    if (defaultSecurityGroup) {
      dispatch(
        change(FORM_ID, SECURITY_GROUPS_FIELD, [
          { ...defaultSecurityGroup, clearableValue: false },
        ]),
      );
    }
  }, [dispatch, resourceProps.value]);

  if (resourceProps.loading) {
    return <LoadingSpinner />;
  }

  if (resourceProps.error) {
    return <div>{translate('Unable to load tenant data.')}</div>;
  }

  if (resourceProps.value) {
    return (
      <>
        <SubnetGroup options={resourceProps.value.subnets} />
        {resourceProps.value.templates.length > 0 ? (
          <FormGroup
            labelClassName="control-label col-sm-3"
            valueClassName="col-sm-9"
            label={translate('Template')}
          >
            <Field
              name="attributes.template"
              component={SelectField}
              options={resourceProps.value.templates}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              isClearable={true}
            />
          </FormGroup>
        ) : null}
        {resourceProps.value.securityGroups.length > 0 ? (
          <FormGroup
            labelClassName="control-label col-sm-3"
            valueClassName="col-sm-9"
            label={translate('Security groups')}
          >
            <Field
              name={SECURITY_GROUPS_FIELD}
              component={SelectField}
              options={resourceProps.value.securityGroups}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isMulti={true}
              isClearable={true}
            />
          </FormGroup>
        ) : null}
        <FormGroup
          labelClassName="control-label col-sm-3"
          valueClassName="col-sm-9"
          label={translate('Nodes')}
        >
          <FieldArray
            name={NODES_FIELD_ARRAY}
            component={NodeList}
            onChange={updateNodesCount}
            flavors={resourceProps.value.flavors}
            volumeTypes={resourceProps.value.volumeTypes}
            mountPoints={resourceProps.value.mountPoints}
            defaultVolumeType={resourceProps.value.defaultVolumeType}
          />
        </FormGroup>
      </>
    );
  }

  return null;
};
