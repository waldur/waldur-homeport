import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FORM_ERROR } from 'final-form';
import { FC, useCallback, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  PatchedMatchingConfigurationRequest,
  proposalProtectedCallsMatchingConfigurationPartialUpdate,
  proposalProtectedCallsMatchingConfigurationRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import {
  NumberField,
  SelectField,
  SubmitButton,
  FieldError,
} from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import {
  EditMatchingSettingProps,
  MatchingConfig,
  AFFINITY_METHOD_LABELS,
  ALGORITHM_LABELS,
} from './types';

interface Props {
  resolve: EditMatchingSettingProps;
}

const fetchMatchingConfiguration = async (callUuid: string) => {
  const response = await proposalProtectedCallsMatchingConfigurationRetrieve({
    path: { uuid: callUuid },
  });
  return response.data as unknown as MatchingConfig;
};

// Field labels for display
const FIELD_LABELS: Record<string, string> = {
  affinity_method: translate('Affinity method'),
  keyword_weight: translate('Keyword weight'),
  text_weight: translate('Text weight'),
  min_reviewers_per_proposal: translate('Min reviewers per proposal'),
  max_reviewers_per_proposal: translate('Max reviewers per proposal'),
  max_proposals_per_reviewer: translate('Max proposals per reviewer'),
  algorithm: translate('Assignment algorithm'),
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  affinity_method: translate(
    'Algorithm used to compute similarity between reviewer expertise and proposal content',
  ),
  keyword_weight: translate(
    'Weight given to keyword matching in the affinity calculation (0-1)',
  ),
  text_weight: translate(
    'Weight given to text similarity (TF-IDF) in the affinity calculation (0-1)',
  ),
  min_reviewers_per_proposal: translate(
    'Minimum number of reviewers that must be assigned to each proposal',
  ),
  max_reviewers_per_proposal: translate(
    'Maximum number of reviewers that can be assigned to each proposal',
  ),
  max_proposals_per_reviewer: translate(
    'Maximum number of proposals a single reviewer can be assigned',
  ),
  algorithm: translate(
    'Algorithm used to assign reviewers to proposals based on affinity scores',
  ),
};

// Field type definitions
const NUMBER_FIELDS = ['keyword_weight', 'text_weight'];
const INTEGER_FIELDS = [
  'min_reviewers_per_proposal',
  'max_reviewers_per_proposal',
  'max_proposals_per_reviewer',
];
const SELECT_FIELDS = ['affinity_method', 'algorithm'];

// Select field options
const AFFINITY_METHOD_OPTIONS = Object.entries(AFFINITY_METHOD_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const ALGORITHM_OPTIONS = Object.entries(ALGORITHM_LABELS).map(
  ([value, label]) => ({ value, label }),
);

const SELECT_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> =
  {
    affinity_method: AFFINITY_METHOD_OPTIONS,
    algorithm: ALGORITHM_OPTIONS,
  };

export const EditMatchingSettingDialog: FC<Props> = ({ resolve }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['matching-config', resolve.call.uuid],
    queryFn: () => fetchMatchingConfiguration(resolve.call.uuid),
  });

  const initialValues = useMemo(() => {
    if (!config) return {};
    return { [resolve.name]: config[resolve.name] };
  }, [config, resolve.name]);

  const processRequest = useCallback(
    async (values: Record<string, any>) => {
      const value = values[resolve.name];
      const body = { [resolve.name]: value };

      try {
        await proposalProtectedCallsMatchingConfigurationPartialUpdate({
          path: { uuid: resolve.call.uuid },
          body: body as PatchedMatchingConfigurationRequest,
        });
        // Invalidate queries to refresh parent component
        await queryClient.invalidateQueries({
          queryKey: ['matching-config', resolve.call.uuid],
        });
        dispatch(showSuccess(translate('Matching setting has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to update matching setting.')),
        );
        if (e.response && e.response.status === 400) {
          return { [FORM_ERROR]: e.response.data };
        }
        return {
          [FORM_ERROR]: translate('Unable to update matching setting.'),
        };
      }
    },
    [resolve, dispatch, queryClient],
  );

  const isNumberField = NUMBER_FIELDS.includes(resolve.name);
  const isIntegerField = INTEGER_FIELDS.includes(resolve.name);
  const isSelectField = SELECT_FIELDS.includes(resolve.name);

  // Wait for config to load before rendering form
  if (isLoading) {
    return (
      <ModalDialog title={resolve.title} closeButton>
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
            closeButton
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
            <FormContainer submitting={submitting} className="size-lg">
              {isNumberField && (
                <FormGroup label={FIELD_LABELS[resolve.name]}>
                  <Field
                    name={resolve.name}
                    component={NumberField as any}
                    min={0}
                    max={1}
                    step={0.1}
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
              {isIntegerField && (
                <FormGroup label={FIELD_LABELS[resolve.name]}>
                  <Field
                    name={resolve.name}
                    component={NumberField as any}
                    min={1}
                    max={20}
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
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
