import * as React from 'react';
import { useDispatch } from 'react-redux';
import { change, FieldArray } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Subnet, Flavor } from '@waldur/openstack/openstack-instance/types';
import { formatVolumeTypeChoices } from '@waldur/openstack/openstack-instance/utils';
import { VolumeType } from '@waldur/openstack/types';
import { formatFlavor } from '@waldur/resource/utils';

import { NodeList } from './NodeList';
import { SubnetGroup } from './SubnetGroup';

const loadData = async settings => {
  const params = {settings};
  const subnets = await getAll<Subnet>('/openstacktenant-subnets/', {params});
  const flavors = await getAll<Flavor>('/openstacktenant-flavors/', {params});
  const volumeTypes = await getAll<VolumeType>('/openstacktenant-volume-types/', {params});
  const mountPoints = ENV.plugins.WALDUR_RANCHER.MOUNT_POINT_CHOICES;
  return {
    subnets: subnets.map(subnet => ({
      label: `${subnet.network_name} / ${subnet.name} (${subnet.cidr})`,
      value: subnet.url,
    })),
    flavors: flavors.map(flavor => ({
      ...flavor,
      label: `${flavor.name} (${formatFlavor(flavor)})`,
      value: flavor.url,
    })),
    volumeTypes: formatVolumeTypeChoices(volumeTypes),
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
          />
        </FormGroup>
      </>
    );
  }

  return null;
};
