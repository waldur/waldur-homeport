import { useQuery } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  proposalProtectedCallsAvailableComplianceChecklistsList,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import {
  NumberField,
  SelectField,
  SubmitButton,
  StringField,
  FieldError,
} from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { FormContainer } from '@/form/FormContainer';
import MarkdownEditor from '@/form/MarkdownEditor';
import { SlugTemplateHelpText } from '@/form/SlugTemplateHelpText';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { closeModalDialog, waitForConfirmation } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { EditCallProps } from '@/proposals/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();
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
          await waitForConfirmation(
            dispatch,
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
        dispatch(showSuccess(translate('The call has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update call.')));
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to update call.') };
      }
    },
    [resolve, dispatch],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={resolve.title}
            closeButton
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
            <FormContainer submitting={submitting} className="size-lg">
              {resolve.name === 'name' && (
                <FormGroup label={translate('Name')} required>
                  <Field
                    name="name"
                    component={StringField as any}
                    validate={required}
                  />
                  <Field
                    name="name"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {resolve.name === 'description' && (
                <FormGroup>
                  <Field
                    name="description"
                    component={MarkdownEditor as any}
                    required
                    autoFocus
                    hideLabel
                    spaceless
                  />
                </FormGroup>
              )}
              {resolve.name === 'reference_code' && (
                <FormGroup label={translate('Reference code')}>
                  <Field name="reference_code" component={StringField as any} />
                  <Field
                    name="reference_code"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {resolve.name === 'external_url' && (
                <FormGroup label={translate('External URL')} required>
                  <Field
                    name="external_url"
                    component={StringField as any}
                    validate={required}
                  />
                  <Field
                    name="external_url"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {(resolve.name === 'reviews_visible_to_submitters' ||
                resolve.name === 'reviewer_identity_visible_to_submitters') && (
                <FormGroup>
                  <Field
                    name={resolve.name}
                    component={AwesomeCheckboxField as any}
                    label={resolve.title}
                  />
                </FormGroup>
              )}
              {resolve.name === 'fixed_duration_in_days' && (
                <FormGroup
                  label={translate(
                    'Fixed duration for granted projects (in days)',
                  )}
                >
                  <Field
                    name="fixed_duration_in_days"
                    component={NumberField as any}
                  />
                  <Field
                    name="fixed_duration_in_days"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {resolve.name === 'compliance_checklist' && (
                <FormGroup label={translate('Compliance checklist')}>
                  <Field
                    name="compliance_checklist"
                    component={SelectField as any}
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
                  />
                  <div className="form-text text-muted">
                    {translate(
                      'Optional checklist for proposal compliance evaluation. Can only be changed when no proposals exist for this call.',
                    )}
                  </div>
                </FormGroup>
              )}
              {resolve.name === 'proposal_slug_template' && (
                <FormGroup label={translate('Proposal slug template')}>
                  <Field
                    name="proposal_slug_template"
                    component={StringField as any}
                  />
                  <Field
                    name="proposal_slug_template"
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                  <SlugTemplateHelpText
                    placeholders={PROPOSAL_SLUG_PLACEHOLDERS}
                  />
                </FormGroup>
              )}
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
