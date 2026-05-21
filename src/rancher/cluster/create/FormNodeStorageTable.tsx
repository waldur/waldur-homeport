import { XIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { Field, useForm } from 'react-final-form';

import { ENV } from '@/core/config';
import { composeValidators } from '@/core/validators';
import { SelectField, StringField } from '@/form';
import { BoxNumberField } from '@/form/BoxNumberField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { ActionButton } from '@/table/ActionButton';

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
  typeValidate?: any;
  sizeValidate?: any;
  onDeleteRow?(): void;
}

export const FormNodeStorageTable: FC<
  PropsWithChildren<FormNodeStorageTableProps>
> = (props) => {
  return (
    <Form.Group>
      <div>
        <table className="table align-middle">
          <thead>
            <tr>
              <th className="w-200px">{props.title}</th>
              <th className="w-125px" />
              {props?.volumeTypeChoices?.length > 0 && (
                <th className="w-250px" />
              )}
            </tr>
          </thead>
          <tbody>{props.children}</tbody>
        </table>
      </div>
    </Form.Group>
  );
};

export const FormNodeStorageRow: FC<FormNodeStorageRowProps> = (props) => {
  const form = useForm();
  useEffect(() => {
    if (props?.defaultVolumeType) {
      form.change(
        `${props.parentName}.${props.typeName}`,
        props.defaultVolumeType.value,
      );
    }
    if (props.sizeName === 'system_volume_size') {
      form.change(
        `${props.parentName}.${props.sizeName}`,
        ENV.plugins.WALDUR_RANCHER.SYSTEM_VOLUME_MIN_SIZE || 1,
      );
    }
  }, [props?.defaultVolumeType, form]);

  const finalSizeValidate = Array.isArray(props.sizeValidate)
    ? composeValidators(...props.sizeValidate)
    : props.sizeValidate;

  const finalTypeValidate = Array.isArray(props.typeValidate)
    ? composeValidators(...props.typeValidate)
    : props.typeValidate;

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
            name={`${props.parentName}.name`}
            component={StringField}
            placeholder={translate('Node name')}
            readOnly
          />
        )}
      </td>
      <td>
        <Field
          name={`${props.parentName}.${props.sizeName}`}
          component={BoxNumberField}
          validate={finalSizeValidate}
          min={1}
          max={props.sizeLimit}
          parse={parseIntField}
          format={formatIntField}
        />
      </td>
      {props?.volumeTypeChoices?.length > 0 && (
        <td>
          <Field
            name={`${props.parentName}.${props.typeName}`}
            component={SelectField}
            validate={finalTypeValidate}
            placeholder={translate('Select volume type...')}
            options={props.volumeTypeChoices}
            getOptionValue={(option) => option.value}
            simpleValue
          />
        </td>
      )}
      {props.onDeleteRow && (
        <td className="w-60px">
          <ActionButton
            variant="text-danger"
            action={props.onDeleteRow}
            iconNode={<XIcon weight="bold" />}
          />
        </td>
      )}
    </tr>
  );
};
