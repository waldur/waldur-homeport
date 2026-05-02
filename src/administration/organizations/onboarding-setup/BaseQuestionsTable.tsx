import { PencilSimpleIcon, DownloadSimpleIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useState } from 'react';
import {
  Checklist,
  checklistsAdminChecklistQuestions,
  checklistsAdminCreate,
  checklistsAdminList,
  checklistsAdminQuestionOptionsCreate,
  checklistsAdminQuestionsCreate,
  checklistsAdminQuestionsDestroy,
  onboardingQuestionMetadataCreate,
  onboardingQuestionMetadataList,
  ChecklistTypeEnum,
} from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { Badge } from '@/core/Badge';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';

import { PredefinedQuestion } from './predefinedQuestions';
import { QuestionFormModal } from './QuestionFormModal';

interface BaseQuestionsTableProps extends TableWithPortal {
  checklistType: 'customer' | 'intent';
  checklistTypeLabel: string;
  predefinedQuestions: PredefinedQuestion[];
  getMappingDisplay: (row: PredefinedQuestion) => JSX.Element;
}

export const BaseQuestionsTable: FC<BaseQuestionsTableProps> = ({
  portal,
  checklistType,
  checklistTypeLabel,
  predefinedQuestions,
  getMappingDisplay,
}) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { openDialog, confirm } = useModal();

  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const checklistTypeKey = `onboarding_${checklistType}` as ChecklistTypeEnum;

  // Fetch existing checklist
  const { data: checklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['onboarding-checklist', checklistType],
    queryFn: async () => {
      const response = await checklistsAdminList({
        query: { checklist_type: checklistTypeKey },
      });
      return response.data[0];
    },
    staleTime: 0, // Don't cache stale data
    refetchOnMount: 'always', // Always refetch on mount
  });

  // Fetch existing questions
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    refetch,
  } = useQuery({
    queryKey: ['checklist-questions', checklistType, checklist?.uuid],
    queryFn: async () => {
      if (!checklist?.uuid) return [];
      try {
        const questions = await checklistsAdminChecklistQuestions({
          path: { uuid: checklist.uuid },
        }).then((res) => res.data);

        // Fetch metadata for each question
        const questionsWithMetadata = await Promise.all(
          questions.map(async (question) => {
            const metadata = await getAllPages((page) =>
              onboardingQuestionMetadataList({
                query: {
                  question_uuid: question.uuid,
                  page,
                  page_size: MAX_PAGE_SIZE,
                },
              }),
            );
            return {
              uuid: question.uuid,
              url: question.url,
              description: question.description || '',
              user_guidance: question.user_guidance || '',
              question_type: question.question_type || 'text_input',
              required: question.required || false,
              order: question.order || 0,
              options: question.question_options?.map((opt) => opt.label) || [],
              question_options: question.question_options || [],
              maps_to_customer_field: metadata[0]?.maps_to_customer_field || '',
              intent_field: metadata[0]?.intent_field || '',
              metadata_uuid: metadata[0]?.uuid,
            };
          }),
        );
        return questionsWithMetadata.sort(
          (a, b) => a.order - b.order,
        ) as PredefinedQuestion[];
      } catch (error) {
        if (error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!checklist?.uuid,
  });

  const handleImportPreset = async () => {
    const hasExistingQuestions = questions && questions.length > 0;
    try {
      await confirm(
        translate('Import preset questions?'),
        hasExistingQuestions
          ? translate(
              'This will delete all existing questions and replace them with predefined {type} questions.',
              { type: checklistTypeLabel },
            )
          : translate('This will import predefined {type} questions.', {
              type: checklistTypeLabel,
            }),
      );
    } catch {
      return;
    }

    setIsImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      // Step 1: Verify checklist exists or create new one
      // Invalidate cache and fetch fresh checklist data to avoid using deleted checklist
      queryClient.invalidateQueries({
        queryKey: ['onboarding-checklist', checklistType],
      });

      const freshChecklistResponse = await checklistsAdminList({
        query: { checklist_type: checklistTypeKey },
      });

      let currentChecklist: Checklist = freshChecklistResponse.data[0];
      if (!currentChecklist) {
        currentChecklist = await checklistsAdminCreate({
          body: {
            name: translate('Organization onboarding {type}', {
              type: checklistTypeLabel,
            }),
            checklist_type: checklistTypeKey,
          },
        }).then((res) => res.data);
      }

      // Step 2: Delete existing questions (fetch fresh to avoid using cached data)
      const freshQuestions = await checklistsAdminChecklistQuestions({
        path: { uuid: currentChecklist.uuid },
      })
        .then((res) => res.data)
        .catch(() => []);

      if (freshQuestions && freshQuestions.length > 0) {
        for (const question of freshQuestions) {
          try {
            await checklistsAdminQuestionsDestroy({
              path: { uuid: question.uuid },
            });
          } catch (e) {
            errors.push(
              `Failed to delete question: ${question.description} - ${e.message}`,
            );
          }
        }
      }

      // Step 3: Create new questions from preset
      for (const question of predefinedQuestions) {
        try {
          const questionData: any = {
            checklist: currentChecklist.url,
            description: question.description,
            user_guidance: question.user_guidance || '',
            question_type: question.question_type,
            required: question.required,
            order: question.order,
          };

          if (question.min_value !== undefined) {
            questionData.min_value = String(question.min_value);
          }
          if (question.max_value !== undefined) {
            questionData.max_value = String(question.max_value);
          }

          const savedQuestion = await checklistsAdminQuestionsCreate({
            body: questionData,
          }).then((res) => res.data);

          // Create options for select questions
          if (
            ['single_select', 'multi_select'].includes(
              question.question_type,
            ) &&
            question.options?.length
          ) {
            for (let i = 0; i < question.options.length; i++) {
              await checklistsAdminQuestionOptionsCreate({
                body: {
                  question: savedQuestion.url,
                  label: question.options[i],
                  order: i,
                },
              });
            }
          }

          // Create metadata
          if (question.maps_to_customer_field || question.intent_field) {
            await onboardingQuestionMetadataCreate({
              body: {
                question: savedQuestion.url,
                maps_to_customer_field: question.maps_to_customer_field || '',
                intent_field: question.intent_field || '',
              },
            });
          }

          successCount++;
        } catch (e) {
          errors.push(
            `Failed to create question: ${question.description} - ${e.message}`,
          );
        }
      }

      // Show results
      if (errors.length > 0) {
        showSuccess(
          translate(
            'Import completed with {errorCount} errors. {count} questions created.',
            {
              count: successCount,
              errorCount: errors.length,
            },
          ),
        );
      } else {
        showSuccess(
          translate(
            'Preset questions imported successfully. {count} questions created.',
            {
              count: successCount,
            },
          ),
        );
      }

      // Refresh data
      queryClient.invalidateQueries({
        queryKey: ['onboarding-checklist', checklistType],
      });
      queryClient.invalidateQueries({
        queryKey: ['checklist-questions', checklistType],
      });
      await refetch();
    } catch (error) {
      showErrorResponse(error, translate('Failed to import preset questions.'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddQuestion = () => {
    openDialog(QuestionFormModal, {
      resolve: {
        checklistType,
        checklist,
        onSave: async () => {
          await refetch();
        },
      },
    });
  };

  const handleEditQuestion = (question: PredefinedQuestion) => {
    openDialog(QuestionFormModal, {
      resolve: {
        question,
        checklistType,
        checklist,
        onSave: async () => {
          await refetch();
        },
      },
    });
  };

  const handleDeleteQuestion = async (question: PredefinedQuestion) => {
    try {
      await confirm(
        translate('Delete question?'),
        translate(
          'Are you sure you want to delete this question: {description}?',
          {
            description: question.description,
          },
        ),
      );
    } catch {
      return;
    }

    try {
      await checklistsAdminQuestionsDestroy({
        path: { uuid: question.uuid },
      });
      showSuccess(translate('Question has been deleted.'));
      await refetch();
    } catch (error) {
      showErrorResponse(error, translate('Failed to delete question.'));
    }
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

  const columns = [
    {
      title: translate('Question'),
      render: ({ row }) => (
        <div className="d-flex flex-column">
          <span className="text-gray-800 fw-bold fs-6 mb-1">
            {row.description}
          </span>
          {row.user_guidance && (
            <span className="text-gray-600 fs-7">{row.user_guidance}</span>
          )}
        </div>
      ),
    },
    {
      title: translate('Type'),
      render: ({ row }) => (
        <Badge variant="purple" pill outline className="px-3 py-2">
          {getQuestionTypeLabel(row.question_type)}
        </Badge>
      ),
    },
    {
      title: translate('Order'),
      render: ({ row }) => (
        <span className="text-gray-800 fw-bold">{row.order}</span>
      ),
    },
    {
      title: translate('Required'),
      render: ({ row }) =>
        row.required ? (
          <Badge variant="danger" pill outline className="px-3 py-2">
            {translate('Required')}
          </Badge>
        ) : (
          <Badge variant="default" pill outline className="px-3 py-2">
            {translate('Optional')}
          </Badge>
        ),
    },
    {
      title: translate('Mapping'),
      render: ({ row }) => getMappingDisplay(row),
    },
  ];

  const rowActions = ({ row }) => (
    <ActionsDropdownComponent>
      <ActionItem
        action={() => handleEditQuestion(row)}
        title={translate('Edit')}
        iconNode={<PencilSimpleIcon weight="bold" />}
      />
      <RemovalActionItem
        action={() => handleDeleteQuestion(row)}
        title={translate('Delete')}
      />
    </ActionsDropdownComponent>
  );

  const tableActions = (
    <>
      <ActionButton
        title={translate('Import preset')}
        action={handleImportPreset}
        disabled={isImporting}
        disabledReason={translate('Import in progress')}
        iconNode={<DownloadSimpleIcon weight="bold" />}
        variant="light"
      />
      <AddButton action={handleAddQuestion} />
    </>
  );

  const tableProps = useTable({
    table: `${checklistType}QuestionsList`,
    fetchData: () => Promise.resolve({ rows: questions || [] }),
  });

  // Sync table state when questions change
  useEffect(() => {
    if (questions) {
      tableProps.fetch();
    }
  }, [questions]);

  if (isLoadingChecklist || isLoadingQuestions) {
    return <LoadingSpinner />;
  }

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('questions')}
      tableActions={tableActions}
      rowActions={rowActions}
      enableExport={false}
      showPageSizeSelector={false}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
    />
  );
};
