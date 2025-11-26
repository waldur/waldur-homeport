import { FC } from 'react';
import { FormControl } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { SelectField, SubmitButton, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { MonacoField } from '@waldur/form/MonacoField';
import { StringField } from '@waldur/form/StringField';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { getKeyTitle, SIDEBAR_STYLES } from './utils';

const SUPPORT_BACKENDS = [
  {
    label: 'Atlassian',
    value: 'atlassian',
  },
  {
    label: 'Zammad',
    value: 'zammad',
  },
  {
    label: 'SMAX',
    value: 'smax',
  },
];

const colorPalette = [
  '#307300',
  '#4E5BA6',
  '#444CE7',
  '#6938EF',
  '#1570EF',
  '#0E9384',
  '#E31B54',
  '#DD2590',
  '#FB6514',
];

const ColorField = (props) => (
  <div className="d-flex flex-wrap">
    {colorPalette.map((color, index) => (
      <div
        key={color}
        role="button"
        className="symbol symbol-50px symbol-circle m-1"
        onFocus={() => props.input.onChange(color)}
        tabIndex={index}
        style={
          color === props.input.value ? { boxShadow: `0 0 12px ${color}` } : {}
        }
      >
        <div className="symbol-label" style={{ backgroundColor: color }} />
      </div>
    ))}
    <FormControl value={props.input.value} onChange={props.input.onChange} />
  </div>
);

interface ConfigurationEditDialogProps {
  resolve: { item: { key; description; type }; initialValues?: any };
}

export const ConfigurationEditDialog: FC<ConfigurationEditDialogProps> = ({
  resolve,
}) => {
  const item = resolve.item;
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const initialValues = resolve.initialValues || {
    value: ENV.plugins.WALDUR_CORE[item.key],
  };

  const onSubmit = async (formData) => {
    try {
      const isFileRemoving =
        item.type === 'image_field' && formData.value === null;

      if (isFileRemoving)
        await overrideSettings({
          body: { [item.key]: null },
        });
      else
        await overrideSettings({
          body: { [item.key]: formData.value ?? '' },
          ...formDataOptions,
        });

      ENV.plugins.WALDUR_CORE[item.key] = formData.value;
      showSuccess(translate('Configuration has been updated.'));
      closeDialog();
      location.reload();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update configuration.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={getKeyTitle(item.key)}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <FormGroup
              label={item.type !== 'boolean' && item.description}
              spaceless
            >
              {item.type === 'html_field' ? (
                <Field
                  component={MonacoField as any}
                  name="value"
                  language="html"
                  height={100}
                />
              ) : item.type === 'dict_field' ? (
                <Field
                  component={MonacoField as any}
                  name="value"
                  language="json"
                  format={(value) => {
                    if (!value) return '';
                    if (typeof value === 'object') {
                      try {
                        return JSON.stringify(value, null, 2);
                      } catch {
                        return '';
                      }
                    }
                    return value;
                  }}
                  height={100}
                />
              ) : item.type === 'text_field' ? (
                <Field component={TextField as any} name="value" />
              ) : item.key === 'SIDEBAR_STYLE' ? (
                <Field
                  component={SelectField as any}
                  name="value"
                  options={SIDEBAR_STYLES}
                  simpleValue
                />
              ) : item.key === 'WALDUR_SUPPORT_ACTIVE_BACKEND_TYPE' ? (
                <Field
                  component={SelectField as any}
                  name="value"
                  options={SUPPORT_BACKENDS}
                  simpleValue
                />
              ) : item.type === 'color_field' ? (
                <Field component={ColorField} name="value" />
              ) : item.type === 'boolean' ? (
                <Field
                  component={AwesomeCheckboxField as any}
                  name="value"
                  label={item.description}
                  hideLabel
                />
              ) : item.type === 'image_field' ? (
                <Field
                  component={WideImageField as any}
                  name="value"
                  initialValue={initialValues.value}
                />
              ) : (
                <Field component={StringField as any} name="value" />
              )}
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
