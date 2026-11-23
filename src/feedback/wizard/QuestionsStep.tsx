import {
  ArrowDownIcon,
  ArrowUpIcon,
  ListChecksIcon,
  PencilSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { isEqual } from 'es-toolkit';
import { FC, useCallback, useMemo, useState } from 'react';
import { useForm, useFormState } from 'react-final-form';

import { AlertItem, Badge, BaseButton } from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useNotify } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import { CopyQuestionsField } from './CopyQuestionsField';
import { LocalQuestionDialog } from './LocalQuestionDialog';
import {
  duplicateDescriptions,
  getTypeLabel,
  moveQuestion,
  pruneStaleConditions,
  removeQuestion,
} from './localQuestions';
import { LocalQuestion, SurveyWizardValues } from './types';
import { getQuestionsReason } from './validation';

interface RowActionsProps {
  row: LocalQuestion;
  onEdit(question: LocalQuestion): void;
  onMove(key: string, offset: number): void;
  onDelete(key: string): void;
}

const QuestionRowActions: FC<RowActionsProps> = ({
  row,
  onEdit,
  onMove,
  onDelete,
}) => {
  const { values } = useFormState<SurveyWizardValues>({
    subscription: { values: true },
  });
  const questions = values.questions ?? [];
  const index = questions.findIndex((question) => question.key === row.key);
  const isFirst = index === 0;
  const isLast = index === questions.length - 1;

  return (
    <ActionsDropdown row={row}>
      <ActionItem
        title={translate('Edit')}
        action={() => onEdit(row)}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Move up')}
        action={() => onMove(row.key, -1)}
        iconNode={<ArrowUpIcon weight="bold" />}
        disabled={isFirst}
        tooltip={isFirst ? translate('This is the first question.') : undefined}
      />
      <ActionItem
        title={translate('Move down')}
        action={() => onMove(row.key, 1)}
        iconNode={<ArrowDownIcon weight="bold" />}
        disabled={isLast}
        tooltip={isLast ? translate('This is the last question.') : undefined}
      />
      <RemovalActionItem
        title={translate('Delete')}
        action={() => onDelete(row.key)}
      />
    </ActionsDropdown>
  );
};

export const QuestionsStep: FC<WizardStepProps> = (props) => {
  const form = useForm<SurveyWizardValues>();
  const { confirm } = useModal();
  const { showInfo } = useNotify();
  const locked = Boolean(props.data?.locked);
  const questions: LocalQuestion[] = props.values.questions ?? [];
  // Holds the question being edited; an empty object is a new question.
  const [editing, setEditing] = useState<{ question?: LocalQuestion }>(null);

  // Handlers read the list from the form, not from the render, so one held by
  // an open dialog or menu (and the memoised columns) never edits a stale list.
  const getQuestions = useCallback(
    (): LocalQuestion[] => form.getState().values.questions ?? [],
    [form],
  );

  const save = useCallback(
    (question: LocalQuestion) => {
      const current = getQuestions();
      const previous = current.find((item) => item.key === question.key);
      if (!previous) {
        form.change('questions', [...current, question]);
        return;
      }
      const next = pruneStaleConditions(
        current.map((item) => (item.key === question.key ? question : item)),
        previous,
      );
      form.change('questions', next);
      // A changed type or a removed option drops or narrows the conditions
      // other questions have on this one; say which, as deleting does.
      const affected = next.filter(
        (item, index) =>
          item.key !== question.key &&
          !isEqual(item.conditions, current[index].conditions),
      );
      if (affected.length) {
        showInfo(
          translate(
            'Conditions on this question changed for: {questions}. Check when they are shown.',
            {
              questions: affected.map((item) => item.description).join(', '),
            },
          ),
        );
      }
    },
    [form, getQuestions, showInfo],
  );

  const append = useCallback(
    (copied: LocalQuestion[]) =>
      form.change('questions', [...getQuestions(), ...copied]),
    [form, getQuestions],
  );

  const move = useCallback(
    (key: string, offset: number) => {
      const current = getQuestions();
      const from = current.findIndex((question) => question.key === key);
      form.change('questions', moveQuestion(current, from, from + offset));
    },
    [form, getQuestions],
  );

  const remove = useCallback(
    async (key: string) => {
      const dependants = getQuestions().filter((question) =>
        question.conditions.some((condition) => condition.depends_on === key),
      );
      if (dependants.length) {
        try {
          await confirm(
            translate('Delete question'),
            translate(
              'These questions are shown depending on the answer to this one: {questions}. Deleting it removes those conditions, so they are always shown.',
              {
                questions: dependants
                  .map((question) => question.description)
                  .join(', '),
              },
            ),
            { forDeletion: true, positiveButton: translate('Delete') },
          );
        } catch {
          return;
        }
      }
      form.change('questions', removeQuestion(getQuestions(), key));
    },
    [form, getQuestions, confirm],
  );

  const columns = useMemo(() => {
    const result: Column<LocalQuestion>[] = [
      {
        title: translate('Question'),
        render: ({ row }) => (
          <span className="inline-flex flex-wrap items-center gap-1.5 text-primary">
            {row.description}
            {row.required && (
              <Badge variant="secondary" size="sm" shape="pill" tone="outline">
                {translate('Required')}
              </Badge>
            )}
            {row.conditions.length > 0 && (
              <Badge
                variant="secondary"
                size="sm"
                shape="pill"
                tone="outline"
                tooltip={translate('Shown depending on other answers.')}
              >
                {translate('Conditional')}
              </Badge>
            )}
          </span>
        ),
      },
      {
        title: translate('Type'),
        render: ({ row }) => getTypeLabel(row.question_type),
      },
    ];
    if (!locked) {
      result.push({
        title: '',
        className: 'w-px',
        render: ({ row }) => (
          <QuestionRowActions
            row={row}
            onEdit={(question) => setEditing({ question })}
            onMove={move}
            onDelete={remove}
          />
        ),
      });
    }
    return result;
  }, [locked, move, remove]);

  const duplicates = duplicateDescriptions(questions);
  // A locked survey keeps its questions as they are, so nothing here blocks it.
  const disabledReason = locked ? undefined : getQuestionsReason(questions);

  return (
    <WizardModal
      {...props}
      submitDisabled={Boolean(disabledReason)}
      submitTooltip={disabledReason}
    >
      {locked && (
        <AlertItem
          type="floating"
          variant="info"
          className="mb-3"
          title={translate(
            "Users have been prompted, so the questionnaire can't be changed.",
          )}
        />
      )}
      {questions.length ? (
        <SimpleTable columns={columns} rows={questions} rowKey="key" />
      ) : (
        <NoResult
          title={translate('No questions yet')}
          message={
            locked
              ? null
              : translate(
                  'Add a question, or copy the questions of another survey.',
                )
          }
          icon={<ListChecksIcon weight="bold" size={24} />}
          callback={locked ? undefined : () => setEditing({})}
          buttonTitle={translate('Add question')}
          noAction={locked}
        />
      )}
      {!locked && duplicates.length > 0 && (
        <AlertItem
          type="floating"
          variant="error"
          className="mt-3"
          title={translate('Two questions have the same text: {questions}', {
            questions: duplicates.join(', '),
          })}
          body={translate('Change or delete one of them.')}
        />
      )}
      {!locked && (
        <div className="mt-5 flex flex-col gap-5">
          {questions.length > 0 && (
            <BaseButton
              variant="tertiary"
              className="self-start"
              label={translate('Add question')}
              iconNode={<PlusIcon weight="bold" />}
              onClick={() => setEditing({})}
            />
          )}
          <CopyQuestionsField
            onCopy={append}
            surveyUuid={props.data?.surveyUuid}
          />
        </div>
      )}
      {editing && (
        <LocalQuestionDialog
          question={editing.question}
          siblings={questions}
          onSave={save}
          onHide={() => setEditing(null)}
        />
      )}
    </WizardModal>
  );
};
