import * as React from 'react';
import * as Panel from 'react-bootstrap/lib/Panel';
import { useDispatch, useSelector } from 'react-redux';
import { Option } from 'react-select';
import { Field, FormSection, change, formValueSelector } from 'redux-form';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { parseIntField, formatIntField } from '@waldur/marketplace/common/utils';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { RemoveButton } from '@waldur/marketplace/offerings/RemoveButton';

import { IntegerUnitField } from './IntegerUnitField';
import { SimpleSelectField } from './SimpleSelectField';

interface OwnProps {
  index: number;
  volume: string;
  onRemove(index: number): void;
  volumeTypes: Option[];
  mountPoints: Option[];
}

const getMinSize = mountPoint =>
  ENV.plugins.WALDUR_RANCHER.MOUNT_POINT_MIN_SIZE[mountPoint];

const validateMountPoint = (value, allValues) => {
  if (!value) {
    return;
  }
  let count = 0;
  for (const node of allValues.attributes.nodes || []) {
    for (const volume of node.data_volumes || []) {
      if (volume.mount_point === value) {
        count++;
      }
      if (count > 1) {
        return translate('Each mount point should be used once at most.');
      }
      const minSize = getMinSize(volume.mount_point);
      if (volume.size < minSize) {
        return translate('Data volume should have at least {size} GB.', {size: minSize});
      }
    }
  }
};

const useMinimalSize = (node, volume) => {
  const prefix = `attributes.nodes[${node}].${volume}`;
  const mountPointField = `${prefix}.mount_point`;
  const sizeField = `${prefix}.size`;

  const dispatch = useDispatch();
  const getSelector = field => state => formValueSelector(FORM_ID)(state, field);

  const mountPoint = useSelector(getSelector(mountPointField));
  const volumeSize = useSelector(getSelector(sizeField));

  return () => {
    const minSize = getMinSize(mountPoint);
    if (!minSize) {
      return;
    }
    if (!volumeSize || volumeSize < minSize) {
      dispatch(change(FORM_ID, sizeField, minSize));
    }
  };
};

export const DataVolumePanel = (props: OwnProps) => {
  const setValidVolumeSize = useMinimalSize(props.index, props.volume);

  return (
    <Panel>
      <Panel.Heading>
        <RemoveButton onClick={() => props.onRemove(props.index)}/>
        <h4>{translate('Data volume #{index}', {index: props.index + 1})}</h4>
      </Panel.Heading>
      <Panel.Body>
        <FormSection name={props.volume}>
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
          <FormGroup
            label={translate('Volume size')}
            required={true}>
            <Field
              name="size"
              units={translate('GB')}
              component={IntegerUnitField}
              parse={parseIntField}
              format={formatIntField}
            />
          </FormGroup>
          {props.volumeTypes.length > 0 && (
            <FormGroup
              label={translate('Volume type')}
              required={true}>
              <Field
                name="volume_type"
                options={props.volumeTypes}
                component={SimpleSelectField}
              />
            </FormGroup>
          )}
        </FormSection>
      </Panel.Body>
    </Panel>
  );
};
