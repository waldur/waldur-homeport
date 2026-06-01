import { useQuery } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProtectedCallsAvailableComplianceChecklistsList,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import {
  BooleanGroup,
  MarkdownGroup,
  NumberGroup,
  SelectGroup,
  StringField,
  StringGroup,
  SubmitButton,
} from '@/form';
import { SlugTemplateHelpText } from '@/form/SlugTemplateHelpText';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { EditCallProps } from '@/proposals/types';
import { useNotify } from '@/store/notify';

const PROPOSAL_SLUG_PLACEHOLDERS = [
  { name: 'call_slug', description: 'Call slug', example: 'TEST-CALL' },
  {
    name: 'round_slug',
    description: 'Round slug',
    example: 'TEST-ROUND-202401',
  },
  { name: 'org_slug', description: 'Organization slug', example: 'acme' },
  { name: 'year', description: 'Current year (4-digit)', example: '2026' },
  { name: 'month', description: 'Current month (2-digit)', example: '04' },
  {
    name: 'counter',
    description: 'Sequential proposal number',
    example: '3',
  },
  {
    name: 'counter_padded',
    description: 'Zero-padded 3-digit counter',
    example: '003',
  },
];

interface FormData {
  name: string;
  description: string;
  fixed_duration_in_days?: number | null;
  compliance_checklist?: string;
  proposal_slug_template?: string;
}

interface Props {
  resolve: EditCallProps;
}

export const EditGeneralInfoDialog = ({ resolve }: Props) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog, confirm } = useModal();

  const initialValues = pick(resolve.call, resolve.name);

  // Query compliance checklists if editing compliance_checklist field
  const { data: complianceChecklists } = useQuery({
    queryKey: ['AvailableComplianceChecklists', resolve.call.customer_uuid],
    queryFn: () =>
      proposalProtectedCallsAvailableComplianceChecklistsList({
        query: {
          checklist_type: 'proposal_compliance',
          customer_uuid: resolve.call.customer_uuid,
        },
      }).then((response) => response.data),
    enabled:
      resolve.name === 'compliance_checklist' && !!resolve.call?.customer_uuid,
    staleTime: STALE_TIME,
  });

  const processRequest = useCallback(
    async (values: FormData) => {
      if (values.fixed_duration_in_days) {
        try {
          await confirm(
            translate('Confirmation'),
            translate(
              'This will also update durations of connected proposals in Draft or In Review states. Continue?',
            ),
          );
        } catch {
          return;
        }
      }
      const body: any = {};

      if (resolve.name === 'fixed_duration_in_days') {
        body.fixed_duration_in_days = values.fixed_duration_in_days || null;
      } else if (resolve.name === 'compliance_checklist') {
        // Transform compliance_checklist from SelectField format to UUID
        body.compliance_checklist =
          (values.compliance_checklist as any)?.value ||
          values.compliance_checklist ||
          null;
      } else {
        body[resolve.name] = values[resolve.name];
      }

      try {
        await proposalProtectedCallsPartialUpdate({
          path: { uuid: resolve.call.uuid },
          body,
        });
        resolve.refetch();
        showSuccess(translate('The call has been updated.'));
        closeDialog();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update call.'));
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to update call.') };
      }
    },
    [resolve],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.title}
            footer={
              <>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Save')}
                />

                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              {resolve.name === 'name' && (
                <StringGroup
                  label={translate('Name')}
                  required
                  name="name"
                  validate={required}
                />
              )}
              {resolve.name === 'description' && (
                <MarkdownGroup
                  name="description"
                  required
                  autoFocus
                  hideLabel
                  spaceless
                />
              )}
              {resolve.name === 'reference_code' && (
                <StringGroup
                  label={translate('Reference code')}
                  name="reference_code"
                />
              )}
              {resolve.name === 'external_url' && (
                <StringGroup
                  label={translate('External URL')}
                  required
                  name="external_url"
                  component={StringField}
                  validate={required}
                />
              )}
              {(resolve.name === 'reviews_visible_to_submitters' ||
                resolve.name === 'reviewer_identity_visible_to_submitters') && (
                <BooleanGroup name={resolve.name} label={resolve.title} />
              )}
              {resolve.name === 'fixed_duration_in_days' && (
                <NumberGroup
                  label={translate(
                    'Fixed duration for granted projects (in days)',
                  )}
                  name="fixed_duration_in_days"
                />
              )}
              {resolve.name === 'compliance_checklist' && (
                <SelectGroup
                  label={translate('Compliance checklist')}
                  name="compliance_checklist"
                  options={
                    complianceChecklists?.map((checklist) => ({
                      value: checklist.uuid,
                      label: checklist.name,
                    })) || []
                  }
                  isClearable={true}
                  placeholder={translate(
                    'Select compliance checklist (optional)',
                  )}
                  description={translate(
                    'Optional checklist for proposal compliance evaluation. Can only be changed when no proposals exist for this call.',
                  )}
                />
              )}
              {resolve.name === 'proposal_slug_template' && (
                <StringGroup
                  label={translate('Proposal slug template')}
                  name="proposal_slug_template"
                  description={
                    <SlugTemplateHelpText
                      placeholders={PROPOSAL_SLUG_PLACEHOLDERS}
                    />
                  }
                />
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
