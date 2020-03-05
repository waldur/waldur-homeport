import * as React from 'react';
import { useDispatch } from 'react-redux';
import { change, FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { NodeList } from './NodeList';
import { SubnetGroup } from './SubnetGroup';
import { loadData } from './utils';

export const TenantGroup = props => {
  const { state: resourceProps, call: loadResource } = useQuery(
    loadData,
    props.tenant,
  );
  React.useEffect(loadResource, [props.tenant]);

  const dispatch = useDispatch();
  const updateNodesCount = React.useCallback(nodes => {
    dispatch(change(FORM_ID, 'limits.node', nodes));
  }, []);

  if (resourceProps.loading) {
    return <LoadingSpinner />;
  }

  if (resourceProps.erred) {
    return <div>{translate('Unable to load tenant data.')}</div>;
  }

  if (resourceProps.loaded) {
    return (
      <>
        <SubnetGroup options={resourceProps.data.subnets} />
        <FormGroup
          labelClassName="control-label col-sm-3"
          valueClassName="col-sm-9"
          label={translate('Nodes')}
        >
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
