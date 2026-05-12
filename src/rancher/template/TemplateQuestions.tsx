import { FC, useMemo } from 'react';

import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

import { Namespace, RancherProject } from '../types';

import { ApplicationConfiguration } from './ApplicationConfiguration';
import { QuestionGroup } from './QuestionGroup';
import { FormData, Question } from './types';
import { groupQuestions } from './utils';

interface OwnProps {
  questions?: Question[];
  versions: string[];
  projects: RancherProject[];
  namespaces: Namespace[];
  createApplication(formData: FormData): Promise<void>;
}

const AnswersSection = ({ questions }: { questions: Question[] }) => {
  const groups = useMemo(() => groupQuestions(questions), [questions]);

  return (
    <>
      {Object.keys(groups).map((group, groupIndex) => (
        <QuestionGroup
          key={groupIndex}
          title={group}
          questions={groups[group]}
          parentName="answers"
        />
      ))}
    </>
  );
};

export const TemplateQuestions: FC<
  OwnProps & { submitting?: boolean; invalid?: boolean }
> = (props) => (
  <>
    <ApplicationConfiguration {...props} />
    {props.questions && <AnswersSection questions={props.questions} />}
    <SubmitButton
      className="btn btn-sm btn-success mt-2"
      submitting={props.submitting}
      label={translate('Create application')}
      disabled={props.invalid || ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE}
    />
  </>
);
