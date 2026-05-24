import { Field, useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { StringField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

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
              input={input}
            />
          )}
        />
      </FormGroup>
      {values?.auto_create_project && (
        <>
          <FormGroup
            label={translate('Project name template')}
            required
            description={translate(
              'Use variables like {full_name}, {email} to create dynamic project names',
            )}
            help={<NameTemplateTooltip />}
          >
            <Field
              name="project_name_template"
              component={StringField}
              placeholder={translate('e.g. {full_name} Research project')}
              disabled={disabled}
              validate={required}
            />
          </FormGroup>
          <FormGroup>
            <Field
              name="allow_custom_project_details"
              render={({ input }) => (
                <AwesomeCheckboxField
                  label={translate(
                    'Allow users to provide custom project name and description',
                  )}
                  alignMiddle
                  disabled={disabled}
                  input={input}
                />
              )}
            />
          </FormGroup>
          <FormGroup>
            <Field
              name="allow_multiple_requests"
              render={({ input }) => (
                <AwesomeCheckboxField
                  label={translate(
                    'Allow users to create multiple projects from this invitation',
                  )}
                  alignMiddle
                  disabled={disabled}
                  input={input}
                />
              )}
            />
          </FormGroup>
        </>
      )}
    </>
  );
};
