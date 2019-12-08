import * as React from 'react';
import { useDispatch } from 'react-redux';
import { change, FieldArray } from 'redux-form';

import { getFirst } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { loadSubnets, loadFlavors } from '@waldur/openstack/api';
import { formatFlavor } from '@waldur/resource/utils';

import { NodeList } from './NodeList';
import { SubnetGroup } from './SubnetGroup';

const fetchFlavorsAndSubnets = async tenant => {
  const settings = await getFirst('/service-settings/', {scope: tenant});
  const subnets = await loadSubnets(settings.uuid);
  const flavors = await loadFlavors(settings.uuid);
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
  };
};

export const TenantSubnetAndFlavor: React.FC<{tenant: string}> = props => {
  if (!props.tenant) {
    return null;
  }

  const {state: resourceProps, call: loadResource} = useQuery(fetchFlavorsAndSubnets, props.tenant);
  React.useEffect(loadResource, [props.tenant]);

  const dispatch = useDispatch();
  const updateNodesCount = React.useCallback(nodes => {
    dispatch(change(FORM_ID, 'limits.node', nodes));
  }, []);

  if (resourceProps.loading) {
    return <LoadingSpinner/>;
  }

  if (resourceProps.erred) {
    return <div>{translate('Unable to load subnets and flavors for the tenant.')}</div>;
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
          />
        </FormGroup>
      </>
    );
  }

  return null;
};
