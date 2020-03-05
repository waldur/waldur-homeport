import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, formValueSelector } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { getMinSize } from './getMinSize';
import { SimpleSelectField } from './SimpleSelectField';
import { getDataVolumes } from './utils';

const createMountPointValidator = nodeIndex => (value, allValues) => {
  if (!value) {
    return;
  }
  const volumes = getDataVolumes(nodeIndex, allValues);
  let count = 0;
  for (const volume of volumes) {
    if (volume.mount_point === value) {
      count++;
    }
    if (count > 1) {
      return translate('Each mount point should be used once at most.');
    }
  }
};

const getSizeField = (nodeIndex, volumeIndex) => {
  const parts = [];
  if (nodeIndex !== undefined) {
    parts.push(`attributes.nodes[${nodeIndex}]`);
  }
  parts.push(`data_volumes[${volumeIndex}]`);
  parts.push('size');
  return parts.join('.');
};

const useMinimalSize = (form, nodeIndex, volumeIndex) => {
  const sizeField = getSizeField(nodeIndex, volumeIndex);
  const dispatch = useDispatch();
  const getSize = state => formValueSelector(form)(state, sizeField);

  const volumeSize = useSelector(getSize);

  return mountPoint => {
    const minSize = getMinSize(mountPoint);
    if (!minSize) {
      return;
    }
    if (!volumeSize || volumeSize < minSize) {
      dispatch(change(form, sizeField, minSize));
    }
  };
};

export const VolumeMountPointGroup = props => {
  const setValidVolumeSize = useMinimalSize(
    props.form,
    props.nodeIndex,
    props.volumeIndex,
  );
  const validateMountPoint = React.useMemo(
    () => [required, createMountPointValidator(props.nodeIndex)],
    [props.nodeIndex],
  );

  return (
    <FormGroup label={translate('Mount point')} required={true}>
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
