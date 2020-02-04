import * as React from 'react';
import { useDispatch } from 'react-redux';
import { change, FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { formatVolumeTypeChoices, getDefaultVolumeType } from '@waldur/openstack/openstack-instance/utils';

import { getFlavors, getSubnets, getVolumeTypes } from './api';
import { NodeList } from './NodeList';
import { SubnetGroup } from './SubnetGroup';
import { formatFlavorOption, formatSubnetOption } from './utils';

const loadData = async settings => {
  const params = {settings};
  const flavors = await getFlavors(params);
  const subnets = await getSubnets(params);
  const volumeTypes = await getVolumeTypes(params);
  const mountPoints = ENV.plugins.WALDUR_RANCHER.MOUNT_POINT_CHOICES;
  const volumeTypeChoices = formatVolumeTypeChoices(volumeTypes);
  const defaultVolumeType = getDefaultVolumeType(volumeTypeChoices);
  return {
    subnets: subnets.map(formatSubnetOption),
    flavors: flavors.map(formatFlavorOption),
    volumeTypes: volumeTypeChoices,
    defaultVolumeType: defaultVolumeType && defaultVolumeType.url,
    mountPoints: mountPoints.map(choice => ({
      label: choice,
      value: choice,
    })),
  };
};

export const TenantGroup = props => {
  const {state: resourceProps, call: loadResource} = useQuery(loadData, props.tenant);
  React.useEffect(loadResource, [props.tenant]);

  const dispatch = useDispatch();
  const updateNodesCount = React.useCallback(nodes => {
    dispatch(change(FORM_ID, 'limits.node', nodes));
  }, []);

  if (resourceProps.loading) {
    return <LoadingSpinner/>;
  }

  if (resourceProps.erred) {
    return <div>{translate('Unable to load tenant data.')}</div>;
  }

  if (resourceProps.loaded) {
    return (
      <>
        <SubnetGroup options={resourceProps.data.subnets}/>
        <FormGroup
          labelClassName="control-label col-sm-3"
          valueClassName="col-sm-9"
          label={translate('Nodes')}>
          <FieldArray
            name="attributes.nodes"
            component={NodeList}
            onChange={updateNodesCount}
            flavors={resourceProps.data.flavors}
            volumeTypes={resourceProps.data.volumeTypes}
            mountPoints={resourceProps.data.mountPoints}
            defaultVolumeType={resourceProps.data.defaultVolumeType}
          />
        </FormGroup>
      </>
    );
  }

  return null;
};
