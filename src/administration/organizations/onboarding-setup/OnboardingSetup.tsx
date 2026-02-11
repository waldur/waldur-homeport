import { Buildings, Target } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Checklist,
  checklistsAdminChecklistQuestions,
  checklistsAdminCreate,
  checklistsAdminList,
  checklistsAdminQuestionOptionsCreate,
  checklistsAdminQuestionsCreate,
  checklistsAdminQuestionsDestroy,
  checklistsAdminQuestionsUpdate,
  onboardingQuestionMetadataCreate,
  onboardingQuestionMetadataList,
  onboardingQuestionMetadataUpdate,
  QuestionAdmin,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { useOfferingCategories } from '@waldur/navigation/sidebar/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import {
  CUSTOMER_CHECKLIST_QUESTIONS,
  INTENT_CHECKLIST_QUESTIONS,
  PredefinedQuestion,
} from './predefinedQuestions';
import { QuestionList } from './QuestionList';

type ChecklistType = 'customer' | 'intent';

interface FormValues {
  customerQuestions: PredefinedQuestion[];
  intentQuestions: PredefinedQuestion[];
}

export const OnboardingSetup: FC = () => {
  const [activeChecklist, setActiveChecklist] = useState<ChecklistType | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Fetch existing checklists
  const { data: existingChecklists, isLoading } = useQuery({
    queryKey: ['onboarding-checklists'],
    queryFn: async () => {
      const [customerResponse, intentResponse] = await Promise.all([
        checklistsAdminList({
          query: { checklist_type: 'onboarding_customer' },
        }),
        checklistsAdminList({
          query: { checklist_type: 'onboarding_intent' },
        }),
      ]);
      return [...customerResponse.data, ...intentResponse.data];
    },
  });

  // Fetch categories for purpose question options
  const categories: Category[] = useOfferingCategories();

  const customerChecklist = useMemo(
    () =>
      existingChecklists?.find(
        (c) => c.checklist_type === 'onboarding_customer',
      ),
    [existingChecklists],
  );

  const intentChecklist = useMemo(
    () =>
      existingChecklists?.find((c) => c.checklist_type === 'onboarding_intent'),
    [existingChecklists],
  );

  // Fetch existing questions for customer checklist
  const { data: customerQuestions, isLoading: isLoadingCustomerQuestions } =
    useQuery({
      queryKey: ['checklist-questions', customerChecklist?.uuid],
      queryFn: async () => {
        if (!customerChecklist?.uuid) return null;
        try {
          const questions = await checklistsAdminChecklistQuestions({
            path: { uuid: customerChecklist.uuid },
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
                description: question.description || '',
                user_guidance: question.user_guidance || '',
                question_type: question.question_type || 'text_input',
                required: question.required || false,
                order: question.order || 0,
                options:
                  question.question_options?.map((opt) => opt.label) || [],
                maps_to_customer_field:
                  metadata[0]?.maps_to_customer_field || '',
                intent_field: metadata[0]?.intent_field || '',
                metadata_uuid: metadata[0]?.uuid,
              };
            }),
          );
          return questionsWithMetadata as PredefinedQuestion[];
        } catch (error) {
          // Silently handle 404 errors (checklist was deleted)
          if (error?.response?.status === 404) {
            return null;
          }
        }
      },
      enabled: !!customerChecklist?.uuid,
    });

  // Fetch existing questions for intent checklist
  const { data: intentQuestions, isLoading: isLoadingIntentQuestions } =
    useQuery({
      queryKey: ['checklist-questions', intentChecklist?.uuid],
      queryFn: async () => {
        if (!intentChecklist?.uuid) return null;
        try {
          const questions = await checklistsAdminChecklistQuestions({
            path: { uuid: intentChecklist.uuid },
          }).then((res) => res.data);

          // Fetch metadata for each question and options
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
                description: question.description || '',
                user_guidance: question.user_guidance || '',
                question_type: question.question_type || 'text_input',
                required: question.required || false,
                order: question.order || 0,
                options:
                  question.question_options?.map((opt) => opt.label) || [],
                maps_to_customer_field:
                  metadata[0]?.maps_to_customer_field || '',
                intent_field: metadata[0]?.intent_field || '',
                metadata_uuid: metadata[0]?.uuid,
              };
            }),
          );
          return questionsWithMetadata as PredefinedQuestion[];
        } catch (error) {
          // Silently handle 404 errors (checklist was deleted)
          if (error?.response?.status === 404) {
            return null;
          }
        }
      },
      enabled: !!intentChecklist?.uuid,
    });

  const handleCardClick = (type: ChecklistType) => {
    setActiveChecklist(type);
  };

  const initialValues: FormValues = useMemo(() => {
    // For customer questions: use existing or empty array
    const customerQuestionsData =
      customerQuestions && customerQuestions.length > 0
        ? customerQuestions
        : [];

    // For intent questions: use existing or empty array
    const intentQuestionsData =
      intentQuestions && intentQuestions.length > 0 ? intentQuestions : [];

    return {
      customerQuestions: customerQuestionsData,
      intentQuestions: intentQuestionsData,
    };
  }, [customerQuestions, intentQuestions]);

  // Get predefined questions with categories populated
  const getPredefinedQuestions = useCallback(
    (type: ChecklistType): PredefinedQuestion[] => {
      if (type === 'customer') {
        return [...CUSTOMER_CHECKLIST_QUESTIONS];
      } else {
        // For intent questions, populate with categories
        return INTENT_CHECKLIST_QUESTIONS.map((q) => {
          if (q.intent_field === 'services' && categories) {
            return {
              ...q,
              options: categories
                .filter((category) => (category.resource_count || 0) > 0)
                .map((category) => category.title),
            };
          }
          return { ...q };
        });
      }
    },
    [categories],
  );

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setIsSubmitting(true);

      try {
        const isCustomer = activeChecklist === 'customer';
        const questionsToSave = isCustomer
          ? values.customerQuestions
          : values.intentQuestions;
        const checklistType = isCustomer
          ? 'onboarding_customer'
          : 'onboarding_intent';
        const checklistName = isCustomer
          ? translate('Organization onboarding customer data')
          : translate('Organization onboarding intent data');
        const existingChecklist = isCustomer
          ? customerChecklist
          : intentChecklist;
        const originalQuestions = isCustomer
          ? customerQuestions
          : intentQuestions;

        let checklist: Checklist;

        // Step 1: Create or use existing checklist
        if (existingChecklist) {
          checklist = existingChecklist;
        } else {
          checklist = await checklistsAdminCreate({
            body: {
              name: checklistName,
              checklist_type: checklistType,
            },
          }).then((res) => res.data);
        }

        // Step 2: Delete removed questions
        if (originalQuestions && originalQuestions.length > 0) {
          const currentQuestionUuids = questionsToSave
            .filter((q) => q.uuid)
            .map((q) => q.uuid);
          const questionsToDelete = originalQuestions.filter(
            (q) => q.uuid && !currentQuestionUuids.includes(q.uuid),
          );

          for (const question of questionsToDelete) {
            await checklistsAdminQuestionsDestroy({
              path: { uuid: question.uuid },
            });
          }
        }

        // Step 3: Create or update questions
        const savedQuestions = [];
        for (const question of questionsToSave) {
          const questionData: any = {
            checklist: checklist.url,
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

          let savedQuestion: QuestionAdmin;

          if (question.uuid) {
            // Update existing question
            savedQuestion = await checklistsAdminQuestionsUpdate({
              path: { uuid: question.uuid },
              body: questionData,
            }).then((res) => res.data);
          } else {
            // Create new question
            savedQuestion = await checklistsAdminQuestionsCreate({
              body: questionData,
            }).then((res) => res.data);
          }

          savedQuestions.push(savedQuestion);

          // Step 4: Handle options for select questions
          if (
            ['single_select', 'multi_select'].includes(question.question_type)
          ) {
            // TODO: Proper options management (create/update/delete)
            // For now, just create new options if question is new
            if (!question.uuid && question.options?.length) {
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
          }

          // Step 5: Create or update onboarding metadata
          if (question.maps_to_customer_field || question.intent_field) {
            if (question.metadata_uuid) {
              // Update existing metadata
              await onboardingQuestionMetadataUpdate({
                path: { uuid: question.metadata_uuid },
                body: {
                  question: savedQuestion.url,
                  maps_to_customer_field: question.maps_to_customer_field || '',
                  intent_field: question.intent_field || '',
                },
              });
            } else {
              // Create new metadata
              await onboardingQuestionMetadataCreate({
                body: {
                  question: savedQuestion.url,
                  maps_to_customer_field: question.maps_to_customer_field || '',
                  intent_field: question.intent_field || '',
                },
              });
            }
          }
        }

        dispatch(
          showSuccess(
            translate(
              '{checklistName} has been saved with {count} questions.',
              {
                checklistName,
                count: savedQuestions.length,
              },
            ),
          ),
        );

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ['onboarding-checklists'],
        });
        queryClient.invalidateQueries({
          queryKey: ['checklist-questions'],
        });

        // Reset active checklist
        setActiveChecklist(null);
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Failed to save onboarding checklist.'),
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      activeChecklist,
      customerChecklist,
      intentChecklist,
      customerQuestions,
      intentQuestions,
      dispatch,
      queryClient,
    ],
  );

  if (isLoading || isLoadingCustomerQuestions || isLoadingIntentQuestions) {
    return <LoadingSpinner />;
  }

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, form, values }) => {
        // Track if the active checklist has been modified
        const isActiveChecklistDirty = useMemo(() => {
          if (!activeChecklist) return false;

          const currentQuestions =
            activeChecklist === 'customer'
              ? values.customerQuestions
              : values.intentQuestions;
          const initialQuestions =
            activeChecklist === 'customer'
              ? initialValues.customerQuestions
              : initialValues.intentQuestions;

          return (
            JSON.stringify(currentQuestions) !==
            JSON.stringify(initialQuestions)
          );
        }, [values, activeChecklist]);

        return (
          <Panel
            title={translate('Onboarding checklist configuration')}
            subtitle={translate(
              'Configure checklists for organization onboarding process. View and edit existing checklists or create new ones.',
            )}
            cardBordered
          >
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <Card
                    className={`h-100 cursor-pointer border-2 ${
                      customerChecklist
                        ? activeChecklist === 'customer'
                          ? 'border-primary bg-light-primary'
                          : 'border-success'
                        : activeChecklist === 'customer'
                          ? 'border-primary bg-light-primary'
                          : 'border-light-dark'
                    }`}
                    onClick={() => handleCardClick('customer')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="p-6">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <Buildings
                          weight="bold"
                          size={32}
                          className="text-primary"
                        />
                        <Card.Title className="fs-5 fw-bold mb-0">
                          {translate('Onboarding customer data')}
                        </Card.Title>
                      </div>
                      <Card.Text className="fs-7 text-gray-600">
                        {customerChecklist
                          ? translate(
                              '✓ Configured. Click to view and edit questions.',
                            )
                          : translate(
                              'Configure customer data collection for organization onboarding.',
                            )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </div>

                <div className="col-md-6">
                  <Card
                    className={`h-100 cursor-pointer border-2 ${
                      intentChecklist
                        ? activeChecklist === 'intent'
                          ? 'border-primary bg-light-primary'
                          : 'border-success'
                        : activeChecklist === 'intent'
                          ? 'border-primary bg-light-primary'
                          : 'border-light-dark'
                    }`}
                    onClick={() => handleCardClick('intent')}
                    style={{ cursor: 'pointer' }}
                  >
                    <Card.Body className="p-6">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <Target
                          weight="bold"
                          size={32}
                          className="text-primary"
                        />
                        <Card.Title className="fs-5 fw-bold mb-0">
                          {translate('Onboarding intent data')}
                        </Card.Title>
                      </div>
                      <Card.Text className="fs-7 text-gray-600">
                        {intentChecklist
                          ? translate(
                              '✓ Configured. Click to view and edit questions.',
                            )
                          : translate(
                              'Configure intent data collection for organization onboarding.',
                            )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </div>
              </div>

              {activeChecklist && (
                <>
                  <div className="separator my-6" />
                  <h4 className="mb-5">
                    {activeChecklist === 'customer'
                      ? translate('Customer data questions')
                      : translate('Intent data questions')}
                  </h4>
                  <QuestionList
                    questions={
                      activeChecklist === 'customer'
                        ? values.customerQuestions
                        : values.intentQuestions
                    }
                    fieldName={
                      activeChecklist === 'customer'
                        ? 'customerQuestions'
                        : 'intentQuestions'
                    }
                    checklistType={activeChecklist}
                    form={form}
                    onSave={handleSubmit}
                    isSubmitting={isSubmitting}
                    isDirty={isActiveChecklistDirty}
                    predefinedQuestions={getPredefinedQuestions(
                      activeChecklist,
                    )}
                  />
                </>
              )}
            </form>
          </Panel>
        );
      }}
    />
  );
};
