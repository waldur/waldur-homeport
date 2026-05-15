import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { useCallback, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  proposalProtectedCallsCoiConfigurationPartialUpdate,
  proposalProtectedCallsCoiConfigurationRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FieldError, NumberField, SelectField, SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';

export interface EditCOISettingProps {
  call: Call;
  name: string;
  title: string;
  refetch: () => void;
}

interface Props {
  resolve: EditCOISettingProps;
}

const fetchCOIConfiguration = async (callUuid: string) => {
  const response = await proposalProtectedCallsCoiConfigurationRetrieve({
    path: { uuid: callUuid },
  });
  return response.data;
};

// Proposal disclosure level options for invitations
const DISCLOSURE_LEVEL_OPTIONS = [
  { value: 'titles_only', label: translate('Titles only') },
  { value: 'titles_and_summaries', label: translate('Titles and summaries') },
  { value: 'full_details', label: translate('Full proposal details') },
];

// COI type options based on backend COITypes enum
const COI_TYPE_OPTIONS = [
  // Real conflicts (must recuse)
  { value: 'INST_SAME', label: translate('Same institution') },
  { value: 'FIN_DIRECT', label: translate('Direct financial interest') },
  { value: 'REL_FAMILY', label: translate('Family relationship') },
  { value: 'ROLE_NAMED', label: translate('Named on proposal') },
  { value: 'COLLAB_ACTIVE', label: translate('Active collaboration') },
  { value: 'REL_MENTOR', label: translate('Mentor/mentee relationship') },
  { value: 'REL_SUPERVISOR', label: translate('Supervisor relationship') },
  // Apparent conflicts (requires management)
  { value: 'COAUTH_RECENT', label: translate('Recent co-authorship') },
  { value: 'INST_DEPT', label: translate('Same department') },
  { value: 'INST_FORMER', label: translate('Former institution') },
  { value: 'ROLE_CONF', label: translate('Conference organizer') },
  { value: 'COLLAB_GRANT', label: translate('Grant collaboration') },
  { value: 'REL_EDITORIAL', label: translate('Editorial relationship') },
  { value: 'COMPET', label: translate('Competitor') },
  // Potential conflicts (disclosure only)
  { value: 'COAUTH_OLD', label: translate('Distant co-authorship') },
  { value: 'INST_CONSORT', label: translate('Consortium membership') },
  { value: 'CONF_ATTEND', label: translate('Conference participation') },
  { value: 'SOC_MEMBER', label: translate('Professional society') },
];

const FIELD_LABELS: Record<string, string> = {
  coauthorship_lookback_years: translate('Co-authorship lookback (years)'),
  coauthorship_threshold_papers: translate('Co-authorship threshold (papers)'),
  institutional_lookback_years: translate('Institutional lookback (years)'),
  include_same_department: translate('Detect same department'),
  include_same_institution: translate('Detect same institution'),
  auto_detect_coauthorship: translate('Auto-detect co-authorship'),
  auto_detect_institutional: translate('Auto-detect institutional affiliation'),
  auto_detect_named_personnel: translate('Auto-detect named personnel'),
  recusal_required_types: translate('Types requiring recusal'),
  management_allowed_types: translate('Types allowing management plan'),
  disclosure_only_types: translate('Types requiring disclosure only'),
  invitation_proposal_disclosure: translate('Proposal disclosure level'),
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  coauthorship_lookback_years: translate(
    'How many years to look back for co-authorship detection',
  ),
  coauthorship_threshold_papers: translate(
    'Minimum shared papers to trigger COI',
  ),
  institutional_lookback_years: translate(
    'How many years to look back for institutional affiliation detection',
  ),
  recusal_required_types: translate(
    'COI types that require the reviewer to recuse from the review',
  ),
  management_allowed_types: translate(
    'COI types where a management plan can be submitted instead of recusal',
  ),
  disclosure_only_types: translate(
    'COI types that only require disclosure without further action',
  ),
  invitation_proposal_disclosure: translate(
    'Controls how much proposal information is disclosed to reviewers in invitations. This helps reviewers assess potential conflicts of interest before accepting.',
  ),
};

const NUMBER_FIELDS = [
  'coauthorship_lookback_years',
  'coauthorship_threshold_papers',
  'institutional_lookback_years',
];

const BOOLEAN_FIELDS = [
  'include_same_department',
  'include_same_institution',
  'auto_detect_coauthorship',
  'auto_detect_institutional',
  'auto_detect_named_personnel',
];

const ARRAY_FIELDS = [
  'recusal_required_types',
  'management_allowed_types',
  'disclosure_only_types',
];

const SELECT_FIELDS = ['invitation_proposal_disclosure'];

const SELECT_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> =
  {
    invitation_proposal_disclosure: DISCLOSURE_LEVEL_OPTIONS,
  };

export const EditCOISettingDialog = ({ resolve }: Props) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['coiConfiguration', resolve.call.uuid],
    queryFn: () => fetchCOIConfiguration(resolve.call.uuid),
  });

  const isArrayField = ARRAY_FIELDS.includes(resolve.name);

  // For array fields, convert to Select options format
  const initialValues = useMemo(() => {
    if (!config) return {};
    const value = config[resolve.name];
    if (isArrayField && Array.isArray(value)) {
      return {
        [resolve.name]: value.map((v) =>
          COI_TYPE_OPTIONS.find((opt) => opt.value === v),
        ),
      };
    }
    return { [resolve.name]: value };
  }, [config, isArrayField, resolve.name]);

  const processRequest = useCallback(
    async (values: Record<string, any>) => {
      let value = values[resolve.name];

      // Convert Select options back to array of values
      if (isArrayField && Array.isArray(value)) {
        value = value.map((opt: { value: string }) => opt.value);
      }

      const body = { [resolve.name]: value };

      try {
        await proposalProtectedCallsCoiConfigurationPartialUpdate({
          path: { uuid: resolve.call.uuid },
          body: body as any,
        });
        // Invalidate all queries with this key to refresh parent component
        await queryClient.invalidateQueries({
          queryKey: ['coiConfiguration', resolve.call.uuid],
        });
        showSuccess(translate('COI setting has been updated.'));
        closeDialog();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update COI setting.'));
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to update COI setting.') };
      }
    },
    [resolve, isArrayField, queryClient],
  );

  const isNumberField = NUMBER_FIELDS.includes(resolve.name);
  const isBooleanField = BOOLEAN_FIELDS.includes(resolve.name);
  const isSelectField = SELECT_FIELDS.includes(resolve.name);

  // Wait for config to load before rendering form to ensure initial values are set
  if (isLoading) {
    return (
      <ModalDialog title={resolve.title}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

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
                  disabled={invalid || isLoading}
                  submitting={submitting}
                  label={translate('Save')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              {isNumberField && (
                <FormGroup label={FIELD_LABELS[resolve.name]}>
                  <Field
                    name={resolve.name}
                    component={NumberField as any}
                    min={1}
                    max={10}
                  />
                  {FIELD_DESCRIPTIONS[resolve.name] && (
                    <div className="form-text text-muted">
                      {FIELD_DESCRIPTIONS[resolve.name]}
                    </div>
                  )}
                  <Field
                    name={resolve.name}
                    component={({ meta }) =>
                      meta.touched && meta.error ? (
                        <FieldError error={meta.error} />
                      ) : null
                    }
                  />
                </FormGroup>
              )}
              {isBooleanField && (
                <FormGroup>
                  <Field
                    name={resolve.name}
                    component={AwesomeCheckboxField as any}
                    label={FIELD_LABELS[resolve.name]}
                  />
                </FormGroup>
              )}
              {isArrayField && (
                <FormGroup label={FIELD_LABELS[resolve.name]}>
                  <Field
                    name={resolve.name}
                    component={SelectField as any}
                    options={COI_TYPE_OPTIONS}
                    isMulti
                    placeholder={translate('Select COI types...')}
                  />
                  {FIELD_DESCRIPTIONS[resolve.name] && (
                    <div className="form-text text-muted">
                      {FIELD_DESCRIPTIONS[resolve.name]}
                    </div>
                  )}
                </FormGroup>
              )}
              {isSelectField && (
                <FormGroup label={FIELD_LABELS[resolve.name]}>
                  <Field
                    name={resolve.name}
                    component={SelectField as any}
                    options={SELECT_FIELD_OPTIONS[resolve.name] || []}
                    simpleValue
                    placeholder={translate('Select an option...')}
                  />
                  {FIELD_DESCRIPTIONS[resolve.name] && (
                    <div className="form-text text-muted">
                      {FIELD_DESCRIPTIONS[resolve.name]}
                    </div>
                  )}
                </FormGroup>
              )}
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
