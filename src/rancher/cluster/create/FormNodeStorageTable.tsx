import { XIcon } from '@phosphor-icons/react';
import { FC, PropsWithChildren, useEffect } from 'react';
import { Field, useForm } from 'react-final-form';

import {
  BaseButton,
  FormField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { ENV } from '@/core/config';
import { composeValidators } from '@/core/validators';
import { NumberField, SelectField, StringField } from '@/form';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';

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
    <FormField>
      <div>
        <Table density="compact" className="align-middle">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{props.title}</TableHead>
              <TableHead className="w-[125px]" />
              {props?.volumeTypeChoices?.length > 0 && (
                <TableHead className="w-[250px]" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>{props.children}</TableBody>
        </Table>
      </div>
    </FormField>
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
    <TableRow>
      <TableCell>
        {props.altRowName ? (
          <BaseInputField solid value={props.altRowName} type="text" readOnly />
        ) : (
          <Field name={`${props.parentName}.name`}>
            {({ input, meta }) => (
              <StringField
                input={input}
                meta={meta}
                placeholder={translate('Node name')}
                readOnly
              />
            )}
          </Field>
        )}
      </TableCell>
      <TableCell>
        <Field
          name={`${props.parentName}.${props.sizeName}`}
          validate={finalSizeValidate}
          parse={parseIntField}
          format={formatIntField}
        >
          {({ input, meta }) => (
            <NumberField
              input={input}
              meta={meta}
              stepperLayout="buttons"
              min={1}
              max={props.sizeLimit}
            />
          )}
        </Field>
      </TableCell>
      {props?.volumeTypeChoices?.length > 0 && (
        <TableCell>
          <Field
            name={`${props.parentName}.${props.typeName}`}
            validate={finalTypeValidate}
          >
            {({ input, meta }) => (
              <SelectField
                input={input}
                meta={meta}
                placeholder={translate('Select volume type...')}
                options={props.volumeTypeChoices}
                getOptionValue={(option) => option.value}
                simpleValue
              />
            )}
          </Field>
        </TableCell>
      )}
      {props.onDeleteRow && (
        <TableCell className="w-[60px]">
          <BaseButton
            tooltip={translate('Remove')}
            variant="text-danger"
            onClick={props.onDeleteRow}
            iconNode={<XIcon weight="bold" />}
            size="lg"
          />
        </TableCell>
      )}
    </TableRow>
  );
};
