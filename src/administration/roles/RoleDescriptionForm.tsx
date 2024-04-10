import { reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { FormContainer, SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';

export const RoleDescriptionForm = reduxForm<
  any,
  { onSubmit; onCancel; role? }
>({
  form: 'RoleDescriptionForm',
})((props) => {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <FormContainer submitting={props.submitting}>
        {ENV.languageChoices.map(({ code, label }) => (
          <StringField
            key={code}
            name={`description_${code}`}
            label={translate('Description ({language})', { language: label })}
          />
        ))}
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={translate('Save')}
        />
        <button
          type="button"
          className="btn btn-secondary ms-2"
          onClick={props.onCancel}
        >
          {translate('Cancel')}
        </button>
      </FormContainer>
    </form>
  );
});
