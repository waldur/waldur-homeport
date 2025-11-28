import { Field, useFormState } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const NameTemplateTooltip = () => (
  <div className="text-start py-1">
    <p className="fw-bold mb-2">{translate('Available variables')}</p>
    <ul className="mb-0 list-unstyled">
      <li>
        {'{full_name} - '} {translate('Full name of the user')}
      </li>
      <li>
        {'{email} - '} {translate('Email address of the user')}
      </li>
      <li>
        {'{username} - '} {translate('Username of the user')}
      </li>
    </ul>
  </div>
);

export const AutoCreateProjectGroup = ({ disabled }) => {
  const { values } = useFormState();
  const projectEnabled = values?.role?.content_type === 'project';

  if (!projectEnabled) {
    return null;
  }

  return (
    <>
      <FormGroup>
        <Field
          name="auto_create_project"
          render={({ input }) => (
            <AwesomeCheckboxField
              label={translate('Auto-create project')}
              alignMiddle
              disabled={values?.type === 'public' || disabled}
              input={input as any}
            />
          )}
        />
      </FormGroup>
      {values?.auto_create_project && (
        <FormGroup
          label={translate('Project name template')}
          required
          description={translate(
            'Use variables like {user.full_name}, {user.email} to create dynamic project names',
          )}
          help={<NameTemplateTooltip />}
        >
          <Field
            name="project_name_template"
            component={StringField as any}
            placeholder={translate('e.g. {user.full_name} Research project')}
            disabled={disabled}
            validate={required}
          />
        </FormGroup>
      )}
    </>
  );
};
