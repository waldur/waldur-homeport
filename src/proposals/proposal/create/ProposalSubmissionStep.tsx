import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { pick } from 'es-toolkit/compat';
import { FORM_ERROR } from 'final-form';
import { createRef, FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { Field, Form } from 'react-final-form';
import {
  proposalProposalsAttachDocument,
  proposalProposalsChecklistRetrieve,
  proposalProposalsSubmit,
  proposalProposalsSubmitAnswers,
  proposalProposalsSubmitChanges,
  proposalProposalsUpdateProjectDetails,
  ProposalReview,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formDataOptions } from '@/core/api';
import { SHORT_STALE_TIME } from '@/core/constants';
import { useAccordionUrlState } from '@/core/useAccordionUrlState';
import { hasUnsavedChanges, NavigationBlocker } from '@/form/NavigationBlocker';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { evaluateCondition } from '@/marketplace-checklist/questionDependencies';
import { useModal } from '@/modal/actions';
import { useCallFixedDuration } from '@/proposals/callQueries';
import { usesCallVocabulary, requestListState } from '@/proposals/presentation';
import { isRequestComplete } from '@/proposals/requestedResourceOptions';
import { useProposalCanSubmit } from '@/proposals/useProposalCanSubmit';
import { useProposalResourceRows } from '@/proposals/useProposalResourceRows';
import { useNotify } from '@/store/notify';

import {
  applicantChangeNote,
  useActingForApplicant,
  useConfirmApplicantChange,
} from '../actingForApplicant';
import {
  anyFieldUnlocked,
  getOpenChangeRequests,
  isPartEditable,
} from '../changeRequests';

import { ChangeRequestNotice } from './ChangeRequestNotice';
import {
  extractComplianceAnswers,
  isComplianceAnswerFilled,
} from './complianceUtils';
import { DeleteDraftAction } from './DeleteDraftAction';
import { isProposalFieldFilled } from './proposalFields';
import { ProposalSidebar } from './ProposalSidebar';
import { createProposalSteps } from './steps';

// Check if compliance checklist is complete based on current form values
const isComplianceComplete = (
  checklistData: any,
  formValues: Record<string, any>,
): boolean => {
  if (!checklistData?.questions?.length) {
    return true; // No questions = complete
  }

  // Build map of question description to field name for dependency lookup
  const questionDescToFieldName: Record<string, string> = {};
  checklistData.questions.forEach((q: any) => {
    questionDescToFieldName[q.description] = `compliance_${q.uuid}`;
  });

  // Check if a question is visible based on its dependencies
  const isQuestionVisible = (question: any): boolean => {
    const depInfo = question.dependencies_info;
    if (!depInfo || !depInfo.conditions?.length) {
      return true; // No dependencies = always visible
    }

    const results = depInfo.conditions.map((condition: any) => {
      const fieldName = questionDescToFieldName[condition.question_description];
      const answerValue = fieldName ? formValues[fieldName] : undefined;
      return evaluateCondition(condition, answerValue);
    });

    return depInfo.logic === 'or'
      ? results.some(Boolean)
      : results.every(Boolean);
  };

  // Get visible required questions
  const visibleRequiredQuestions = checklistData.questions.filter(
    (q: any) => q.required && isQuestionVisible(q),
  );

  // Check if all visible required questions have answers
  return visibleRequiredQuestions.every((question: any) => {
    const fieldName = `compliance_${question.uuid}`;
    return isComplianceAnswerFilled(formValues[fieldName]);
  });
};

// The picker holds the sub-domain as an option object while the API takes a
// bare uuid. A plain string is passed through: clearing a value the form never
// wrapped would silently drop the applicant's science domain.
const toProjectDetailsBody = (formValues: any) => {
  const subDomain = formValues.science_sub_domain;
  return {
    ...formValues,
    science_sub_domain:
      typeof subDomain === 'string' ? subDomain : (subDomain?.uuid ?? null),
  };
};

interface AttachedDocuments {
  uploaded: File[];
  refused: { file: File; error: unknown }[];
}

const NOTHING_ATTACHED: AttachedDocuments = { uploaded: [], refused: [] };

/** A file the backend would not take: a duplicate, a wrong type. */
const isRefusal = (error: any) => error?.status === 400;

/**
 * Uploads the pending files one at a time, so a file repeated within one save
 * is refused like one the proposal already holds. A refusal does not stop the
 * others: the caller reports each refused file by name and keeps it pending.
 * Anything else (the session gone, the server down) fails the save as before.
 */
const attachDocuments = async (
  proposal_uuid,
  supporting_documentation,
): Promise<AttachedDocuments> => {
  const files: File[] = Object.values(supporting_documentation || {});
  const result: AttachedDocuments = { uploaded: [], refused: [] };
  for (const file of files) {
    try {
      await proposalProposalsAttachDocument({
        path: { uuid: proposal_uuid },
        body: { file },
        ...formDataOptions,
      });
      result.uploaded.push(file);
    } catch (error) {
      if (!isRefusal(error)) {
        throw error;
      }
      result.refused.push({ file, error });
    }
  }
  return result;
};

const submitComplianceAnswers = async (
  proposal_uuid: string,
  formData: Record<string, unknown>,
  checklistData?: {
    questions?: Array<{ uuid: string; question_type: string }>;
  },
) => {
  const complianceAnswers = extractComplianceAnswers(formData, checklistData);

  if (complianceAnswers.length > 0) {
    try {
      await proposalProposalsSubmitAnswers({
        path: { uuid: proposal_uuid },
        body: complianceAnswers,
      });
    } catch {
      // Don't throw - compliance errors shouldn't block main proposal saving
    }
  }
};

// What only Save as draft or Submit sends. Resource requests and the team are
// saved by their own dialogs; the form just mirrors them for the step ticks.
const MIRRORED_FIELDS = ['resources', 'resources_init', 'users'];
const isSavedByDraft = (field: string) =>
  !MIRRORED_FIELDS.some(
    (name) =>
      field === name ||
      field.startsWith(`${name}.`) ||
      field.startsWith(`${name}[`),
  );

export const ProposalSubmissionStep: FC<{
  proposal;
  call?;
  reviews?: ProposalReview[];
  refetch;
  /** Whether the viewer may submit, not only edit, the proposal. */
  canSubmitProposal?: boolean;
}> = ({ proposal, call, reviews, refetch, canSubmitProposal = true }) => {
  const { confirm } = useModal();
  const router = useRouter();
  // Staff or the call team editing a submitted proposal whose changes were
  // asked for: every save changes what the applicant submitted.
  const actingForApplicant = useActingForApplicant(proposal);
  const confirmApplicantChange = useConfirmApplicantChange(proposal);

  const { showErrorResponse, showSuccess } = useNotify();

  const queryClient = useQueryClient();
  const proposal_uuid = proposal.uuid;

  // Query the proposal checklist with all questions (including hidden ones for real-time validation)
  const { data: checklistData } = useQuery({
    queryKey: ['ProposalChecklist', proposal_uuid, 'include_all'],
    queryFn: () =>
      proposalProposalsChecklistRetrieve({
        path: { uuid: proposal_uuid },
        query: { include_all: true },
      })
        .then((response) => response.data)
        .catch((err) => {
          // If 400 with "No checklist configured", return null
          if (
            err.response?.status === 400 &&
            err.response?.data?.detail?.includes('No checklist configured')
          ) {
            return null;
          }
          throw err;
        }),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
  });

  const initialValues = useMemo(() => {
    const baseValues = {
      name: proposal.name,
      description: proposal.description,
      project_summary: proposal.project_summary,
      // The picker works with option objects; the API takes a bare uuid, so the
      // value is unwrapped again in toProjectDetailsBody before it is sent.
      science_sub_domain: proposal.science_sub_domain
        ? {
            uuid: proposal.science_sub_domain,
            name: proposal.science_sub_domain_name,
          }
        : null,
      // One of the call's allowed_duration_months; null where it offers none.
      requested_duration_months: proposal.requested_duration_months ?? null,
      resources: [],
      resources_init: [], // Temporary field to hold current resource requests
      users: [],
    };

    // Add compliance answers to initial values if available
    if (checklistData?.questions) {
      checklistData.questions.forEach((question) => {
        const fieldName = `compliance_${question.uuid}`;
        let answerData = question.existing_answer?.answer_data ?? null;

        // Transform single_select arrays to single values for UI display
        if (
          question.question_type === 'single_select' &&
          Array.isArray(answerData) &&
          answerData.length > 0
        ) {
          answerData = answerData[0]; // Convert ["uuid"] to "uuid" for SelectField
        }

        baseValues[fieldName] = answerData;
      });
    }

    return baseValues;
  }, [proposal, checklistData]);

  // Only add compliance step if checklist has questions
  const shouldAddComplianceStep =
    checklistData &&
    checklistData.questions &&
    checklistData.questions.length > 0;

  // Calculate steps based on whether proposal has meaningful compliance checklist
  const formSteps = useMemo(() => {
    // The compliance step is driven by the checklist query rather than the
    // call's own flag, so a synthetic value stands in for it; the field config
    // comes from the real call.
    return createProposalSteps({
      compliance_checklist: shouldAddComplianceStep ? 'exists' : undefined,
      proposal_field_config: call?.proposal_field_config,
    });
  }, [shouldAddComplianceStep, call]);

  // Changes asked of a submitted proposal reopen only the sections holding
  // a part they unlock; a draft shows them all.
  const changeRequests = useMemo(
    () => getOpenChangeRequests(proposal),
    [proposal],
  );
  const changesRequested = changeRequests.length > 0;
  const shownSteps = useMemo(() => {
    if (!changesRequested) return formSteps;
    const unlocked = (part: string) => isPartEditable(proposal, part);
    const shown: Record<string, boolean> = {
      'step-general': true,
      'step-project': anyFieldUnlocked(changeRequests) || unlocked('documents'),
      'step-compliance': unlocked('compliance'),
      'step-resource-requests': unlocked('resources'),
      'step-team': unlocked('team'),
    };
    return formSteps.filter((step) => shown[step.id] ?? false);
  }, [formSteps, changesRequested, changeRequests, proposal]);

  // Get panel IDs for accordion URL state management
  const panelIds = useMemo(
    () => shownSteps.map((step) => step.id),
    [shownSteps],
  );

  // Manage accordion open/closed state via URL query params.
  // Project details is open on arrival: it holds the first fields the
  // applicant has to fill in, so an all-collapsed page gives no hint of where
  // to start. An explicit `panels` param in the URL still wins.
  const { isPanelOpen, togglePanel } = useAccordionUrlState(panelIds, [
    'step-project',
  ]);

  const stepRefs = useRef([]);
  // Recalculate step refs when steps change (e.g., when compliance step is added)
  stepRefs.current = useMemo(() => {
    return shownSteps.map((_, i) => stepRefs.current[i] ?? createRef());
  }, [shownSteps]);

  // Store form reference for updating fields after save
  const formRef = useRef<any>(null);

  // Track previous checklistData to detect changes after save
  const prevChecklistDataRef = useRef(checklistData);

  // Sync compliance form fields when checklistData is refetched (e.g., after saving)
  // This ensures file uploads show as "Uploaded" instead of "Pending" after save
  useEffect(() => {
    if (!formRef.current || !checklistData?.questions) return;

    // Only sync if checklistData has actually changed
    if (prevChecklistDataRef.current === checklistData) return;
    prevChecklistDataRef.current = checklistData;

    checklistData.questions.forEach((question) => {
      const fieldName = `compliance_${question.uuid}`;
      let answerData = question.existing_answer?.answer_data || null;

      // Transform single_select arrays to single values for UI display
      if (
        question.question_type === 'single_select' &&
        Array.isArray(answerData) &&
        answerData.length > 0
      ) {
        answerData = answerData[0];
      }

      // Update the form field with the new value from backend
      const currentValue = formRef.current.getState().values[fieldName];
      // Only update if the current value has 'content' (pending upload) and
      // the new value has 'stored_file_id' (processed upload)
      if (
        currentValue &&
        typeof currentValue === 'object' &&
        'content' in currentValue &&
        answerData &&
        typeof answerData === 'object' &&
        'stored_file_id' in answerData
      ) {
        formRef.current.change(fieldName, answerData);
      }
    });
  }, [checklistData]);

  // Every request, not the page the table shows: the duration is the longest
  // of all of them.
  const { data: resourceRows } = useProposalResourceRows(proposal_uuid);
  const fixedDurationDays = useCallFixedDuration(proposal.call_uuid);
  const { data: canSubmit } = useProposalCanSubmit(proposal);

  // What Save as draft sent becomes the form's starting point, so none of it
  // counts as unsaved. keepDirtyOnReinitialize would otherwise hold on to it
  // after the refetch, and the next save would attach the same files again.
  // Anything typed or dropped while the save ran stays unsaved. The mirrored
  // lists keep their empty start: pristine, the next refetch would empty them.
  const markSaved = (saved: any, uploaded: File[]) => {
    const form = formRef.current;
    if (!form) return;
    form.batch(() => {
      form.initialize({
        ...saved,
        ...pick(form.getState().initialValues, MIRRORED_FIELDS),
        supporting_documentation: undefined,
      });
      const pending: File[] = Object.values(
        form.getState().values.supporting_documentation || {},
      );
      const left = pending.filter((file) => !uploaded.includes(file));
      form.change('supporting_documentation', left.length ? left : undefined);
    });
  };

  // What a save sends: everything of a draft, and of a proposal sent back
  // for changes only the parts unlocked.
  const saveEditableParts = useCallback(
    async (formValues: any): Promise<AttachedDocuments> => {
      if (!changesRequested || anyFieldUnlocked(changeRequests)) {
        await proposalProposalsUpdateProjectDetails({
          path: { uuid: proposal_uuid },
          body: toProjectDetailsBody(formValues),
        });
      }
      if (isPartEditable(proposal, 'compliance')) {
        await submitComplianceAnswers(proposal_uuid, formValues, checklistData);
      }
      if (isPartEditable(proposal, 'documents')) {
        return attachDocuments(
          proposal_uuid,
          formValues.supporting_documentation,
        );
      }
      return NOTHING_ATTACHED;
    },
    [proposal, proposal_uuid, changesRequested, changeRequests, checklistData],
  );

  // One notice, whether one file was refused or a whole folder of them.
  const reportRefusedDocuments = useCallback(
    (refused: AttachedDocuments['refused']) => {
      if (!refused.length) return;
      const names = refused.map(({ file }) => file.name).join(', ');
      showErrorResponse(
        refused[0].error,
        refused.length === 1
          ? translate('{file} was not attached', { file: names })
          : translate('{count} files were not attached: {files}', {
              count: refused.length,
              files: names,
            }),
      );
    },
    [showErrorResponse],
  );

  // What a save leaves behind once the backend has it: the compliance answers
  // re-read, the proposal refetched, and only then the uploaded files taken
  // out of the form, or the step would read incomplete in between.
  const settleSaved = useCallback(
    async (formValues: any, uploaded: File[]) => {
      await queryClient.invalidateQueries({
        queryKey: ['ProposalChecklist', proposal_uuid],
      });
      if (refetch) await refetch();
      markSaved(formValues, uploaded);
    },
    // markSaved reads the form through a ref and needs no dependency.

    [queryClient, proposal_uuid, refetch],
  );

  const { mutate: saveAsDraft, isPending: isSaving } = useMutation({
    mutationFn: async (formValues: any) => {
      try {
        const { uploaded, refused } = await saveEditableParts(formValues);
        await settleSaved(formValues, uploaded);
        reportRefusedDocuments(refused);
        showSuccess(
          usesCallVocabulary()
            ? translate('Proposal updated successfully')
            : translate('Access request updated successfully'),
        );
      } catch (error) {
        showErrorResponse(error, translate('Something went wrong'));
      }
    },
  });

  const submitForm = useCallback(
    async (formValues: any) => {
      try {
        await confirm(
          translate('Confirmation'),
          changesRequested
            ? actingForApplicant
              ? `${translate(
                  'Submit the changes? Every open request for changes is answered, the parts unlocked are locked again and the proposal goes back to its evaluators.',
                )} ${applicantChangeNote()}`
              : translate(
                  'Submit the changes? Every open request for changes is answered, the parts unlocked are locked again and the proposal goes back to its evaluators.',
                )
            : usesCallVocabulary()
              ? translate('Are you sure you want to submit the proposal?')
              : translate(
                  'Are you sure you want to submit the access request?',
                ),
        );
      } catch {
        // Reported as a failed submit, not a successful one, so the form still
        // counts its changes as unsaved and warns before leaving the page.
        // Nothing renders the value; it only marks the submit as failed.
        return { [FORM_ERROR]: 'cancelled' };
      }
      try {
        const { uploaded, refused } = await saveEditableParts(formValues);
        if (refused.length) {
          // The applicant stays on the page: what was saved leaves the form
          // as after a draft save, the refused files stay pending for them
          // to remove or replace, and the proposal is not submitted.
          await settleSaved(formValues, uploaded);
          reportRefusedDocuments(refused);
          return { [FORM_ERROR]: 'documents' };
        }
        if (changesRequested) {
          await proposalProposalsSubmitChanges({
            path: { uuid: proposal_uuid },
          });
          showSuccess(translate('Changes submitted successfully'));
        } else {
          await proposalProposalsSubmit({ path: { uuid: proposal_uuid } });
          showSuccess(
            usesCallVocabulary()
              ? translate('Proposal submitted successfully')
              : translate('Access request submitted successfully'),
          );
        }
        // Leave the edit page rather than mutating it in place: on submit the
        // proposal flips out of 'draft', which would swap the form for the
        // read-only view and pop the stepper in above — a jarring live update.
        // Send the applicant to their proposals list instead.
        router.stateService.go(requestListState());
      } catch (error) {
        showErrorResponse(error, translate('Something went wrong'));
        return { [FORM_ERROR]: error };
      }
    },
    [
      proposal_uuid,
      changesRequested,
      actingForApplicant,
      saveEditableParts,
      settleSaved,
      reportRefusedDocuments,
      router,
    ],
  );

  return (
    <Form
      onSubmit={submitForm}
      initialValues={initialValues}
      // initialValues is rebuilt whenever the proposal or checklist is refetched
      // (after Save as draft, or on a revisit). Without this the reset drops
      // unsaved input and empties the lists the steps tick against.
      keepDirtyOnReinitialize
      render={({
        handleSubmit,
        submitting,
        form,
        values,
        dirtyFields,
        hasValidationErrors,
      }) => {
        // Store form reference for use in effects
        formRef.current = form;

        const completedSteps = shownSteps.map((step) => {
          // Special handling for compliance step - real-time client-side validation
          if (step.id === 'step-compliance') {
            return isComplianceComplete(checklistData, values);
          }
          // A row on its own is not a request. Attaching an offering creates
          // one asking for nothing, which would otherwise tick this step green
          // and let the applicant submit a proposal awarded zero of everything
          // — validate_requested_amounts_present refuses exactly that. A
          // required option of the offering left unanswered (a QoS, say) is
          // refused the same way.
          // Judged on every request: resources_init holds only the rows the
          // table last fetched (one page, the filtered offering, the first page
          // in templates mode). The full list is the query every add, edit
          // and delete already invalidates; the table's rows stand in until it
          // loads.
          if (step.id === 'step-resource-requests') {
            const rows = resourceRows ?? values?.resources_init ?? [];
            return rows.length > 0 && rows.every(isRequestComplete);
          }
          if (step.required && step.requiredFields?.length) {
            return step.requiredFields.every((fieldName) =>
              isProposalFieldFilled(fieldName, values, proposal),
            );
          }
          return true;
        });

        return (
          <form onSubmit={handleSubmit}>
            {/* Filled through change() rather than an input, so registered
                here: keepDirtyOnReinitialize only keeps registered fields. */}
            <Field
              name="resources_init"
              subscription={{}}
              render={() => null}
            />
            <Field name="users" subscription={{}} render={() => null} />
            <SidebarLayout.Container fluid>
              <SidebarLayout.Body>
                {actingForApplicant && (
                  <AlertItem
                    variant="warning"
                    type="floating"
                    className="mb-4"
                    title={translate('You are editing for the applicant')}
                    body={applicantChangeNote()}
                    data-testid="editing-for-applicant"
                  />
                )}
                {changesRequested && (
                  <ChangeRequestNotice
                    changeRequests={changeRequests}
                    className="mb-4"
                  />
                )}
                {shownSteps.map((step, i) => (
                  <div ref={stepRefs.current[i]} key={step.id}>
                    <step.component
                      id={step.id}
                      title={step.label}
                      params={{
                        proposal,
                        call,
                        refetch,
                        reviews,
                        form,
                        change: form.change,
                        values,
                        isCompleted: completedSteps[i],
                        isRequired: step.required,
                        isOpen: isPanelOpen(step.id),
                        onToggle: (isOpen: boolean) =>
                          togglePanel(step.id, isOpen),
                      }}
                    />
                  </div>
                ))}
              </SidebarLayout.Body>

              <SidebarLayout.Sidebar transparent>
                <ProposalSidebar
                  steps={shownSteps}
                  resourceRows={resourceRows as any}
                  fixedDurationDays={fixedDurationDays}
                  chosenDurationMonths={values?.requested_duration_months}
                  saveAsDraft={async () => {
                    const confirmed = await confirmApplicantChange(
                      translate(
                        'Save your changes to the project details, compliance answers and documents.',
                      ),
                    );
                    if (confirmed) saveAsDraft(values);
                  }}
                  isSaving={isSaving}
                  hasUnsavedChanges={hasUnsavedChanges(
                    dirtyFields,
                    isSavedByDraft,
                  )}
                  editable={proposal.state === 'draft' || changesRequested}
                  changesRequested={changesRequested}
                  submitting={submitting}
                  completedSteps={completedSteps}
                  hasValidationErrors={hasValidationErrors}
                  canSubmit={canSubmit}
                  canSubmitProposal={canSubmitProposal}
                  deleteAction={
                    proposal.state === 'draft' && canSubmitProposal ? (
                      <DeleteDraftAction proposal={proposal} />
                    ) : undefined
                  }
                />
              </SidebarLayout.Sidebar>
            </SidebarLayout.Container>
            <NavigationBlocker
              exiting="proposals.manage-proposal"
              isTracked={isSavedByDraft}
              warnOnUnload
            />
          </form>
        );
      }}
    />
  );
};
