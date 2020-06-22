import * as React from 'react';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { change, FieldArray } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { NodeList } from './NodeList';
import { SubnetGroup } from './SubnetGroup';
import { loadData } from './utils';

export const TenantGroup = (props) => {
  const resourceProps = useAsync(() => loadData(props.tenant), [props.tenant]);

  const dispatch = useDispatch();
  const updateNodesCount = React.useCallback(
    (nodes) => {
      dispatch(change(FORM_ID, 'limits.node', nodes));
    },
    [dispatch],
  );

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
        <FormGroup
          labelClassName="control-label col-sm-3"
          valueClassName="col-sm-9"
          label={translate('Nodes')}
        >
          <FieldArray
            name="attributes.nodes"
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
