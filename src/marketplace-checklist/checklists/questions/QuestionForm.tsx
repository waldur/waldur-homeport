import { getIn, Mutator } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import { Checklist, QuestionAdmin } from 'waldur-js-client';

import { Checkbox, Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { AtLeast } from '@/core/types';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import {
  ChecklistQuestionForm,
  VisibilityQuestion,
} from '@/marketplace-checklist/types';
import { CHECKLIST_FLAGS } from '@/marketplace-checklist/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { QuestionGeneralForm } from './QuestionGeneralForm';
import { QuestionGuidanceForm } from './QuestionGuidanceForm';
import { QuestionReviewTriggersForm } from './QuestionReviewTriggersForm';
import { QuestionVisibilityForm } from './QuestionVisibilityForm';

interface QuestionFormProps {
  title: string;
  initialValues: ChecklistQuestionForm;
  isEdit: boolean;
  // Resolves true once the question is stored; false keeps the form open.
  onSubmit(values: ChecklistQuestionForm): Promise<boolean>;
  onDone(): void;
  checklist?: AtLeast<Checklist, 'uuid' | 'url'>;
  // The saved question, left out of its own visibility conditions.
  question?: AtLeast<QuestionAdmin, 'uuid'>;
  visibilityQuestions?: VisibilityQuestion[];
  // Unsaved questions: no answer guidance, no review triggers, no order.
  local?: boolean;
}

// Option keys follow every add, removal and move of an option, which the
// options field does through these mutators alone.
const withOptionKeys =
  (name: 'push' | 'remove' | 'move'): Mutator =>
  (args, state, tools) => {
    const result = arrayMutators[name](args, state, tools);
    if (args[0] === 'options' && getIn(state.formState.values, 'option_keys')) {
      const rest = name === 'push' ? [undefined] : args.slice(1);
      arrayMutators[name](['option_keys', ...rest], state, tools);
    }
    return result;
  };

const mutators = {
  ...arrayMutators,
  push: withOptionKeys('push'),
  remove: withOptionKeys('remove'),
  move: withOptionKeys('move'),
};

export const QuestionForm: FC<QuestionFormProps> = ({
  title,
  initialValues,
  isEdit,
  onSubmit,
  onDone,
  checklist,
  question,
  visibilityQuestions,
  local,
}) => {
  const [createAnother, setCreateAnother] = useState(false);
  const showUserGuidance = !local && CHECKLIST_FLAGS.questionFormUserGuidance;
  const showTriggers = !local && CHECKLIST_FLAGS.questionFormTriggers;

  return (
    <Form
      onSubmit={async (values: ChecklistQuestionForm, form) => {
        if (!(await onSubmit(values))) {
          return;
        }
        if (createAnother) {
          form.restart();
          setCreateAnother(false);
        } else {
          onDone();
        }
      }}
      mutators={mutators}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid, values }) => (
        <form
          onSubmit={(event) => {
            // The form can sit inside another form's dialog (the survey
            // wizard), and React bubbles submit through portals to it.
            event.stopPropagation();
            return handleSubmit(event);
          }}
        >
          <ModalDialog
            title={title}
            bodyClassName="h-[500px] max-h-[500px]"
            footer={
              <>
                {!isEdit && (
                  <Checkbox
                    label={translate('Create another')}
                    disabled={submitting}
                    checked={createAnother}
                    onCheckedChange={setCreateAnother}
                    className="me-auto"
                    id="check-another"
                  />
                )}
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={
                    isEdit ? translate('Save changes') : translate('Confirm')
                  }
                  variant="primary"
                />
              </>
            }
          >
            <Tabs mount="visited" defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">
                  {translate('General')}
                </TabsTrigger>
                {showUserGuidance && (
                  <TabsTrigger value="user-guidance">
                    {translate('User guidance')}
                  </TabsTrigger>
                )}
                {CHECKLIST_FLAGS.questionFormVisibility && (
                  <TabsTrigger value="visibility">
                    {translate('Visibility')}
                  </TabsTrigger>
                )}
                {showTriggers && (
                  <TabsTrigger value="triggers">
                    {translate('Triggers')}
                  </TabsTrigger>
                )}
              </TabsList>
              <div className="tab-content">
                <TabsContent value="general">
                  <QuestionGeneralForm
                    values={values}
                    checklist={checklist}
                    local={local}
                  />
                </TabsContent>
                {showUserGuidance && (
                  <TabsContent value="user-guidance">
                    <QuestionGuidanceForm values={values} />
                  </TabsContent>
                )}
                {CHECKLIST_FLAGS.questionFormVisibility && (
                  <TabsContent value="visibility">
                    <QuestionVisibilityForm
                      checklistUuid={checklist?.uuid}
                      question={question}
                      questions={visibilityQuestions}
                    />
                  </TabsContent>
                )}
                {showTriggers && (
                  <TabsContent value="triggers">
                    <QuestionReviewTriggersForm />
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </ModalDialog>
        </form>
      )}
    />
  );
};
