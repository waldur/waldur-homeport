import { useQuery } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { FC, useCallback, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  GenerateSuggestionsRequestRequest,
  Proposal,
  proposalProposalsList,
  proposalProtectedCallsGenerateSuggestions,
} from 'waldur-js-client';

import { FormGroup, StringGroup, SubmitButton, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useNotify } from '@/store/notify';

import { Call } from '../../types';

interface GenerateMatchesDialogProps {
  resolve: {
    call: Call;
    refetch: () => void;
  };
}

interface SourceOption {
  value: GenerateSuggestionsRequestRequest['source'];
  label: string;
  description: string;
}

const sourceOptions: SourceOption[] = [
  {
    value: 'call_description',
    label: translate('Call description'),
    description: translate(
      "Match reviewers against the call's name and description. Use this when no proposals exist yet.",
    ),
  },
  {
    value: 'all_proposals',
    label: translate('All proposals'),
    description: translate(
      'Find reviewers with expertise across all submitted proposals.',
    ),
  },
  {
    value: 'selected_proposals',
    label: translate('Selected proposals'),
    description: translate(
      'Choose specific proposals to find matching reviewers.',
    ),
  },
  {
    value: 'custom_keywords',
    label: translate('Custom keywords'),
    description: translate('Search for reviewers with specific expertise.'),
  },
];

const searchModeOptions = [
  {
    value: 'expertise_only',
    label: translate('Expertise keywords only'),
  },
  {
    value: 'full_text',
    label: translate('Full text search'),
  },
];

interface FormValues {
  source: SourceOption;
  selected_proposals: { value: string; label: string }[];
  keywords: string;
  keyword_search_mode: { value: string; label: string };
  min_threshold: number;
}

export const GenerateMatchesDialog: FC<GenerateMatchesDialogProps> = ({
  resolve,
}) => {
  const { showErrorResponse, showSuccess } = useNotify();

  const { closeDialog } = useModal();

  // Fetch proposals for this call
  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals', resolve.call.uuid],
    queryFn: async () => {
      const response = await proposalProposalsList({
        query: {
          call_uuid: resolve.call.uuid,
          page_size: 100,
        },
      });
      return response.data;
    },
  });

  const proposalOptions = useMemo(
    () =>
      proposals?.map((p: Proposal) => ({
        value: p.uuid,
        label: `${p.slug || p.uuid.slice(0, 8)}: ${p.name}`,
      })) || [],
    [proposals],
  );

  const processRequest = useCallback(
    async (values: FormValues) => {
      try {
        const body: GenerateSuggestionsRequestRequest = {
          source: values.source?.value || 'all_proposals',
        };

        if (values.source?.value === 'selected_proposals') {
          body.proposal_uuids = values.selected_proposals?.map((p) => p.value);
        }

        if (values.source?.value === 'custom_keywords') {
          // Parse keywords from comma-separated string
          const keywordList = values.keywords
            ?.split(',')
            .map((k) => k.trim())
            .filter((k) => k.length > 0);
          body.keywords = keywordList;
          body.keyword_search_mode = values.keyword_search_mode?.value as
            'expertise_only' | 'full_text';
        }

        if (values.min_threshold !== undefined && values.min_threshold > 0) {
          body.min_affinity_threshold = values.min_threshold / 100;
        }

        const response = await proposalProtectedCallsGenerateSuggestions({
          path: { uuid: resolve.call.uuid },
          body,
        });

        const data = response.data;

        resolve.refetch();
        showSuccess(
          translate(
            'Checked {checked} reviewers, generated {created} suggestions.',
            {
              checked: data.reviewers_evaluated,
              created: data.suggestions_created,
            },
          ),
        );
        closeDialog();
      } catch (e) {
        showErrorResponse(e, translate('Unable to generate matches.'));
        if (e.response?.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return { [FORM_ERROR]: translate('Unable to generate matches.') };
      }
    },
    [resolve],
  );

  const validate = useCallback((values: FormValues) => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (
      values.source?.value === 'selected_proposals' &&
      (!values.selected_proposals || values.selected_proposals.length === 0)
    ) {
      errors.selected_proposals = translate(
        'Please select at least one proposal.',
      );
    }

    if (
      values.source?.value === 'custom_keywords' &&
      (!values.keywords || values.keywords.trim().length === 0)
    ) {
      errors.keywords = translate('Please enter at least one keyword.');
    }

    return errors;
  }, []);

  return (
    <Form
      onSubmit={processRequest}
      validate={validate}
      initialValues={{
        source: sourceOptions.find((s) => s.value === 'all_proposals'),
        keyword_search_mode: searchModeOptions[0],
        min_threshold: 10,
      }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Generate reviewer matches')}
            subtitle={
              <ScopeSubtitle
                label={translate('Call name')}
                name={resolve.call.name}
              />
            }
            footer={
              <>
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Generate matches')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              <SelectGroup
                label={translate('Match reviewers against')}
                required
                name="source"
                options={sourceOptions}
                getOptionLabel={(option: SourceOption) => option.label}
                getOptionValue={(option: SourceOption) => option.value}
                isClearable={false}
                description={values.source?.description}
              />

              {/* Call description preview */}
              {values.source?.value === 'call_description' && (
                <div className="border rounded p-3 bg-light mb-4">
                  <div className="fw-bold mb-2">{resolve.call.name}</div>
                  {resolve.call.description ? (
                    <div
                      className="text-muted small"
                      style={{
                        maxHeight: '100px',
                        overflow: 'auto',
                      }}
                    >
                      {resolve.call.description}
                    </div>
                  ) : (
                    <div className="text-warning small">
                      {translate('No description available for this call.')}
                    </div>
                  )}
                </div>
              )}

              {/* All proposals info */}
              {values.source?.value === 'all_proposals' && (
                <div className="border rounded p-3 bg-light mb-4">
                  {proposalsLoading ? (
                    <span className="text-muted">
                      {translate('Loading proposals...')}
                    </span>
                  ) : proposals && proposals.length > 0 ? (
                    <span>
                      {translate(
                        '{count} proposals will be used for matching.',
                        {
                          count: proposals.length,
                        },
                      )}
                    </span>
                  ) : (
                    <span className="text-warning">
                      {translate(
                        'No proposals found. Consider using "Call description" instead.',
                      )}
                    </span>
                  )}
                </div>
              )}

              {/* Selected proposals */}
              {values.source?.value === 'selected_proposals' && (
                <SelectGroup
                  name="selected_proposals"
                  options={proposalOptions}
                  isMulti
                  isLoading={proposalsLoading}
                  placeholder={translate('Select proposals...')}
                  label={translate('Select proposals')}
                  required
                />
              )}

              {/* Custom keywords */}
              {values.source?.value === 'custom_keywords' && (
                <>
                  <StringGroup
                    label={translate('Keywords')}
                    required
                    name="keywords"
                    placeholder={translate(
                      'machine learning, climate science, AI',
                    )}
                    description={translate(
                      'Enter keywords separated by commas.',
                    )}
                  />

                  <SelectGroup
                    label={translate('Search mode')}
                    name="keyword_search_mode"
                    options={searchModeOptions}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    isClearable={false}
                    description={
                      values.keyword_search_mode?.value === 'expertise_only'
                        ? translate(
                            "Match only against reviewer's declared expertise keywords.",
                          )
                        : translate(
                            'Search across all reviewer content including publications and bio.',
                          )
                    }
                  />
                </>
              )}

              {/* Advanced options */}
              <details className="mb-4">
                <summary className="cursor-pointer text-muted">
                  {translate('Advanced options')}
                </summary>
                <div className="mt-3">
                  <FormGroup label={translate('Minimum match score (%)')}>
                    <Field
                      name="min_threshold"
                      component="input"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      className="form-range"
                    />
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">0%</small>
                      <strong>{values.min_threshold || 0}%</strong>
                      <small className="text-muted">100%</small>
                    </div>
                  </FormGroup>
                </div>
              </details>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
