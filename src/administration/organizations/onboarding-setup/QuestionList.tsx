import { Trash, PencilSimple, DownloadSimpleIcon } from '@phosphor-icons/react';
import { FormApi } from 'final-form';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { AddButton } from '@waldur/core/AddButton';
import { Badge } from '@waldur/core/Badge';
import { SaveButton } from '@waldur/core/SaveButton';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

import { PredefinedQuestion } from './predefinedQuestions';
import { QuestionFormModal } from './QuestionFormModal';

interface QuestionListProps {
  questions: PredefinedQuestion[];
  fieldName: string;
  checklistType: 'customer' | 'intent';
  form: FormApi;
  onSave: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
  predefinedQuestions: PredefinedQuestion[];
}

export const QuestionList: FC<QuestionListProps> = ({
  questions,
  fieldName,
  checklistType,
  form,
  onSave,
  isSubmitting,
  isDirty,
  predefinedQuestions,
}) => {
  const dispatch = useDispatch();
  const { showSuccess } = useNotify();

  // Sort questions by order and normalize order values to sequential integers
  const sortAndNormalizeQuestions = (questions: PredefinedQuestion[]) => {
    const sorted = [...questions].sort((a, b) => a.order - b.order);
    return sorted.map((q, idx) => ({ ...q, order: idx }));
  };

  const handleRemoveQuestion = (index: number) => {
    const currentQuestions = [...questions];
    currentQuestions.splice(index, 1);
    const sortedQuestions = sortAndNormalizeQuestions(currentQuestions);
    form.change(fieldName, sortedQuestions);
  };

  const handleEditQuestion = (index: number) => {
    dispatch(
      openModalDialog(QuestionFormModal, {
        resolve: {
          question: questions[index],
          checklistType,
          onSave: (question: PredefinedQuestion) => {
            const currentQuestions = [...questions];
            currentQuestions[index] = question;
            const sortedQuestions = sortAndNormalizeQuestions(currentQuestions);
            form.change(fieldName, sortedQuestions);
            showSuccess(translate('Question has been updated.'));
          },
        },
      }),
    );
  };

  const handleAddQuestion = () => {
    dispatch(
      openModalDialog(QuestionFormModal, {
        resolve: {
          checklistType,
          onSave: (question: PredefinedQuestion) => {
            const currentQuestions = [...questions];
            question.order = currentQuestions.length;
            currentQuestions.push(question);
            const sortedQuestions = sortAndNormalizeQuestions(currentQuestions);
            form.change(fieldName, sortedQuestions);
            showSuccess(translate('Question has been added.'));
          },
        },
      }),
    );
  };

  const handleImportPreset = () => {
    const sortedQuestions = sortAndNormalizeQuestions(predefinedQuestions);
    form.change(fieldName, sortedQuestions);
    showSuccess(
      translate('Preset questions have been imported ({count} questions).', {
        count: sortedQuestions.length,
      }),
    );
  };

  const getQuestionTypeLabel = (type: string) => {
    const typeMap = {
      text_input: translate('Text input'),
      text_area: translate('Text area'),
      email: translate('Email'),
      phone_number: translate('Phone'),
      number: translate('Number'),
      single_select: translate('Single select'),
      multi_select: translate('Multi select'),
      boolean: translate('Yes/No'),
      date: translate('Date'),
      file: translate('File'),
      country: translate('Country'),
    };
    return typeMap[type] || type;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h4 className="mb-1">{translate('Questions')}</h4>
          <p className="text-muted mb-0">
            {translate('{count} questions configured', {
              count: questions.length,
            })}
          </p>
        </div>
        <div className="d-flex gap-2">
          <ActionButton
            title={translate('Import preset')}
            action={handleImportPreset}
            disabled={questions.length > 0}
            iconNode={<DownloadSimpleIcon weight="bold" />}
            tooltip={
              questions.length > 0
                ? translate(
                    'Cannot import preset when questions already exist. Delete all questions first.',
                  )
                : undefined
            }
            variant="light"
          />
          <AddButton action={handleAddQuestion} />
          <SaveButton
            onClick={onSave}
            submitting={isSubmitting}
            dirty={isDirty}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-rounded table-row-bordered table-row-gray-100 align-middle gs-3 gy-3">
          <thead>
            <tr className="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">
              <th style={{ width: '35%' }}>{translate('Question')}</th>
              <th style={{ width: '15%' }}>{translate('Type')}</th>
              <th style={{ width: '15%' }}>{translate('Order')}</th>
              <th style={{ width: '12%' }}>{translate('Required')}</th>
              <th style={{ width: '20%' }}>{translate('Mapping')}</th>
              <th className="text-end pe-4" style={{ width: '100px' }}>
                {translate('Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-8">
                  <div className="fs-5 mb-2">
                    {translate('No questions configured')}
                  </div>
                  <div className="text-muted">
                    {translate(
                      'Click the "Import preset" button to load predefined questions or use the "Add" button to create custom questions.',
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              questions.map((question, index) => (
                <tr key={index}>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="text-gray-800 fw-bold fs-6 mb-1">
                        {question.description}
                      </span>
                      {question.user_guidance && (
                        <span className="text-gray-600 fs-7">
                          {question.user_guidance}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant="purple" pill outline className="px-3 py-2">
                      {getQuestionTypeLabel(question.question_type)}
                    </Badge>
                  </td>
                  <td className="ps-4">
                    <span className="text-gray-800 fw-bold">
                      {question.order}
                    </span>
                  </td>
                  <td>
                    {question.required ? (
                      <Badge
                        variant="danger"
                        pill
                        outline
                        className="px-3 py-2"
                      >
                        {translate('Required')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        pill
                        outline
                        className="px-3 py-2"
                      >
                        {translate('Optional')}
                      </Badge>
                    )}
                  </td>
                  <td>
                    {question.maps_to_customer_field && (
                      <div className="mb-1">
                        <span className="text-gray-600 fs-7">
                          {translate('Customer')}:{' '}
                        </span>
                        <code className="text-primary">
                          {question.maps_to_customer_field}
                        </code>
                      </div>
                    )}
                    {question.intent_field && (
                      <div>
                        <span className="text-gray-600 fs-7">
                          {translate('Intent')}:{' '}
                        </span>
                        <code className="text-primary">
                          {question.intent_field}
                        </code>
                      </div>
                    )}
                    {!question.maps_to_customer_field &&
                      !question.intent_field && (
                        <span className="text-muted">—</span>
                      )}
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-icon btn-sm btn-light btn-text-secondary"
                        onClick={() => handleEditQuestion(index)}
                        title={translate('Edit')}
                      >
                        <PencilSimple size={18} weight="bold" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-icon btn-sm btn-light btn-text-danger"
                        onClick={() => handleRemoveQuestion(index)}
                        title={translate('Delete')}
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
