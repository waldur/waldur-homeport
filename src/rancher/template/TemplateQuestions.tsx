import * as React from 'react';
import * as Form from 'react-bootstrap/lib/Form';
import { reduxForm, FormSection } from 'redux-form';

import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

import { ApplicationConfiguration } from './ApplicationConfiguration';
import { QuestionGroup } from './QuestionGroup';
import { Question } from './types';
import { groupQuestions } from './utils';

interface OwnProps {
  questions: Question[];
  versions: string[];
  projects: string[];
  namespaces: string[];
  createApplication(formData: any): Promise<void>;
}

const connector = reduxForm<any, OwnProps>({
  form: 'RancherTemplateQuestions',
});

export const TemplateQuestions = connector(props => {
  const groups = React.useMemo(() => groupQuestions(props.questions), [
    props.questions,
  ]);
  return (
    <Form onSubmit={props.handleSubmit(props.createApplication)}>
      <ApplicationConfiguration {...props} />
      <FormSection name="answers">
        {Object.keys(groups).map((group, groupIndex) => (
          <QuestionGroup
            key={groupIndex}
            title={group}
            questions={groups[group]}
          />
        ))}
      </FormSection>
      <SubmitButton
        className="btn btn-sm btn-success m-t-sm"
        submitting={props.submitting}
        label={translate('Create application')}
        disabled={props.invalid}
      />
    </Form>
  );
});
