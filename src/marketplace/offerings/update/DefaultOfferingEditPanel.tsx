import { get } from 'lodash-es';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { CheckOrX } from '@waldur/core/CheckOrX';
import { StaffOnlyIndicator } from '@waldur/core/StaffOnlyIndicator';
import { TruncatedDescription } from '@waldur/core/TruncatedDescription';
import { SecretField, SelectField, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import FormTable from '@waldur/form/FormTable';
import { SecretField as PlainSecretField } from '@waldur/marketplace/common/SecretField';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { isStaff as isStaffSelector } from '@waldur/workspace/selectors';

export interface OfferingEditField {
  key: string;
  label: string;
  description?: string;
  component?: any;
  fieldProps?: any;
  disabled?: boolean;
  hideLabel?: boolean;
  warnTooltip?: string;
  isStaffOnly?: boolean;
  value?(value: any): any;
}

export const DefaultOfferingEditPanel: FunctionComponent<
  { fields: OfferingEditField[] } & OfferingEditPanelFormProps
> = (props) => {
  const isStaff = useSelector(isStaffSelector);
  return (
    <>
      {props.fields.map((field) => (
        <FormTable.Item
          key={field.key}
          label={field.label}
          description={field.description}
          value={
            field.value ? (
              field.value(get(props.offering, field.key))
            ) : field.component === TextField ? (
              <TruncatedDescription
                text={get(props.offering, field.key) || DASH_ESCAPE_CODE}
              />
            ) : field.component === SecretField ? (
              <PlainSecretField value={get(props.offering, field.key)} />
            ) : field.component === AwesomeCheckboxField ? (
              <CheckOrX value={get(props.offering, field.key)} />
            ) : field.component === CommaSeparatedListField ? (
              (get(props.offering, field.key) || []).join(', ')
            ) : field.component === SelectField ? (
              (get(props.offering, field.key) || []).join(', ')
            ) : (
              get(props.offering, field.key, 'N/A')
            )
          }
          required={field.fieldProps?.required}
          disabled={field.disabled}
          warnTooltip={field.warnTooltip}
          actions={
            !field.isStaffOnly || isStaff ? (
              <FieldEditButton
                title={field.label}
                scope={props.offering}
                name={field.key}
                callback={props.callback}
                fieldComponent={field.component}
                fieldProps={field.fieldProps}
                hideLabel={field.hideLabel}
              />
            ) : (
              <StaffOnlyIndicator />
            )
          }
        />
      ))}
    </>
  );
};
