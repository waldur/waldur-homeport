import { FC, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { BaseFieldProps, Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { SelectField, StringField } from '@waldur/form';
import { BoxNumberField } from '@waldur/form/BoxNumberField';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';

interface FormNodeStorageTableProps {
  title?: string;
  volumeTypeChoices?: any[];
}

interface FormNodeStorageRowProps {
  parentName: string;
  typeName: string;
  sizeName: string;
  altRowName?: string;
  volumeTypeChoices?: any[];
  defaultVolumeType?: any;
  /** In GB */
  sizeLimit: number;
  typeValidate?: BaseFieldProps['validate'];
  sizeValidate?: BaseFieldProps['validate'];
  change(field: string, value: any): void;
  onDeleteRow?(): void;
}

export const FormNodeStorageTable: FC<FormNodeStorageTableProps> = (props) => {
  return (
    <Form.Group>
      <div>
        <table className="table align-middle">
          <thead>
            <tr>
              <th className="w-200px">{props.title}</th>
              <th className="w-125px"></th>
              {props?.volumeTypeChoices?.length > 0 && (
                <th className="w-250px"></th>
              )}
            </tr>
          </thead>
          <tbody>{props.children}</tbody>
        </table>
      </div>
    </Form.Group>
  );
};

export const FormNodeStorageRow = (props: FormNodeStorageRowProps) => {
  useEffect(() => {
    if (props?.defaultVolumeType) {
      props.change(
        `${props.parentName}.${props.typeName}`,
        props.defaultVolumeType.value,
      );
    }
    if (props.sizeName === 'system_volume_size') {
      props.change(
        `${props.parentName}.${props.sizeName}`,
        ENV.plugins.WALDUR_RANCHER.SYSTEM_VOLUME_MIN_SIZE || 1,
      );
    }
  }, [props?.defaultVolumeType, props.change]);

  return (
    <tr>
      <td>
        {props.altRowName ? (
          <Form.Control
            className="form-control-solid"
            value={props.altRowName}
            type="text"
            readOnly
          />
        ) : (
          <Field
            name="name"
            component={StringField}
            placeholder={translate('Node name')}
            readOnly
          />
        )}
      </td>
      <td>
        <Field
          name={props.sizeName}
          component={BoxNumberField}
          validate={props.sizeValidate}
          min={1}
          max={props.sizeLimit}
          parse={parseIntField}
          format={formatIntField}
        />
      </td>
      {props?.volumeTypeChoices?.length > 0 && (
        <td>
          <Field
            name={props.typeName}
            component={SelectField}
            validate={props.typeValidate}
            placeholder={translate('Select volume type') + '...'}
            options={props.volumeTypeChoices}
            getOptionValue={(option) => option.value}
            simpleValue
          />
        </td>
      )}
      {props.onDeleteRow && (
        <td className="w-60px">
          <Button
            variant="light"
            className="btn-icon btn-active-light-danger"
            onClick={props.onDeleteRow}
          >
            <i className="fa fa-times fs-4"></i>
          </Button>
        </td>
      )}
    </tr>
  );
};
