import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, formValueSelector } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { getMinSize } from './getMinSize';
import { SimpleSelectField } from './SimpleSelectField';

const createMountPointValidator = nodeIndex => (value, allValues) => {
  if (!value) {
    return;
  }
  const nodes = allValues.attributes.nodes;
  if (nodeIndex >= nodes.length) {
    return;
  }
  let count = 0;
  const volumes = nodes[nodeIndex].data_volumes || [];
  for (const volume of volumes) {
    if (volume.mount_point === value) {
      count++;
    }
    if (count > 1) {
      return translate('Each mount point should be used once at most.');
    }
  }
};

const useMinimalSize = (nodeIndex, volumeIndex) => {
  const prefix = `attributes.nodes[${nodeIndex}].data_volumes[${volumeIndex}]`;
  const sizeField = `${prefix}.size`;

  const dispatch = useDispatch();
  const getSelector = field => state => formValueSelector(FORM_ID)(state, field);

  const volumeSize = useSelector(getSelector(sizeField));

  return mountPoint => {
    const minSize = getMinSize(mountPoint);
    if (!minSize) {
      return;
    }
    if (!volumeSize || volumeSize < minSize) {
      dispatch(change(FORM_ID, sizeField, minSize));
    }
  };
};

export const VolumeMountPointGroup = props => {
  const setValidVolumeSize = useMinimalSize(props.nodeIndex, props.volumeIndex);
  const validateMountPoint = React.useMemo(() =>
    [required, createMountPointValidator(props.nodeIndex)],
    [props.nodeIndex]
  );

  return (
    <FormGroup
      label={translate('Mount point')}
      required={true}>
      <Field
        name="mount_point"
        options={props.mountPoints}
        component={SimpleSelectField}
        validate={validateMountPoint}
        onChange={setValidVolumeSize}
      />
    </FormGroup>
  );
};
