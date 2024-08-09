import { FormControl } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { SelectField, SubmitButton, TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import { MonacoField } from '@waldur/form/MonacoField';
import { StringField } from '@waldur/form/StringField';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { saveConfig } from './api';
import { getKeyTitle } from './utils';

const SIDEBAR_STYLES = [
  {
    label: translate('Primary accent'),
    value: 'accent',
  },
  {
    label: translate('Dark'),
    value: 'dark',
  },
  {
    label: translate('Light'),
    value: 'light',
  },
];

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

export const ConfigurationEditDialog = reduxForm<
  FormData,
  { resolve: { item: { key; description; type } } }
>({
  form: 'ConfigurationEditDialog',
})((props) => {
  const item = props.resolve.item;
  const dispatch = useDispatch();
  const callback = async (formData) => {
    try {
      await saveConfig({ [item.key]: formData.value });
      ENV.plugins.WALDUR_CORE[item.key] = formData.value;
      dispatch(showSuccess(translate('Configuration has been updated.')));
      dispatch(closeModalDialog());
      location.reload();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update configuration.')),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={getKeyTitle(item.key)}
        bodyClassName="pb-2"
        footerClassName="border-0 pt-0 gap-2"
        footer={
          <>
            <CloseDialogButton className="flex-grow-1" />
            <SubmitButton
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={translate('Confirm')}
              className="btn btn-primary flex-grow-1"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          {item.type === 'html_field' ? (
            <MonacoField
              name="value"
              mode="html"
              height={100}
              label={item.description}
            />
          ) : item.type === 'text_field' ? (
            <TextField name="value" label={item.description} />
          ) : item.key === 'SIDEBAR_STYLE' ? (
            <SelectField
              floating={false}
              name="value"
              label={item.description}
              options={SIDEBAR_STYLES}
              simpleValue
            />
          ) : item.key === 'WALDUR_SUPPORT_ACTIVE_BACKEND_TYPE' ? (
            <SelectField
              floating={false}
              name="value"
              label={item.description}
              options={SUPPORT_BACKENDS}
              simpleValue
            />
          ) : item.type === 'color_field' ? (
            <ColorField name="value" label={item.description} />
          ) : item.type === 'boolean' ? (
            <AwesomeCheckboxField name="value" label={item.description} />
          ) : item.type === 'image_field' ? (
            <WideImageField name="value" label={item.description} />
          ) : (
            <StringField name="value" label={item.description} />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
