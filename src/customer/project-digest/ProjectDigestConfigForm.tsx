import { FC, useCallback, useMemo } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { NumberField } from '@waldur/form/NumberField';
import { SelectField } from '@waldur/form/SelectField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import {
  ProjectDigestConfig,
  sendTestDigest,
  updateProjectDigestConfig,
} from './api';

interface ProjectDigestConfigFormProps {
  config: ProjectDigestConfig;
  customerUuid: string;
  onUpdated: () => void;
}

const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: () => translate('Weekly') },
  { value: 'biweekly', label: () => translate('Bi-weekly') },
  { value: 'monthly', label: () => translate('Monthly') },
];

const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: () => translate('Sunday') },
  { value: 1, label: () => translate('Monday') },
  { value: 2, label: () => translate('Tuesday') },
  { value: 3, label: () => translate('Wednesday') },
  { value: 4, label: () => translate('Thursday') },
  { value: 5, label: () => translate('Friday') },
  { value: 6, label: () => translate('Saturday') },
];

export const ProjectDigestConfigForm: FC<ProjectDigestConfigFormProps> = ({
  config,
  customerUuid,
  onUpdated,
}) => {
  const dispatch = useDispatch();

  const frequencyOptions = useMemo(
    () => FREQUENCY_OPTIONS.map((o) => ({ value: o.value, label: o.label() })),
    [],
  );

  const dayOfWeekOptions = useMemo(
    () =>
      DAY_OF_WEEK_OPTIONS.map((o) => ({ value: o.value, label: o.label() })),
    [],
  );

  const initialValues = useMemo(
    () => ({
      is_enabled: config?.is_enabled ?? false,
      frequency: config?.frequency ?? 'monthly',
      enabled_sections: config?.enabled_sections ?? [],
      day_of_week: config?.day_of_week ?? 1,
      day_of_month: config?.day_of_month ?? 1,
    }),
    [config],
  );

  const availableSections = config?.available_sections ?? [];

  const onSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        await updateProjectDigestConfig(customerUuid, values);
        dispatch(
          showSuccess(translate('Digest configuration updated successfully.')),
        );
        onUpdated();
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to update digest configuration.'),
          ),
        );
      }
    },
    [customerUuid, onUpdated, dispatch],
  );

  const handleSendTest = useCallback(async () => {
    try {
      await sendTestDigest(customerUuid);
      dispatch(
        showSuccess(
          translate('Test digest email has been sent to your email address.'),
        ),
      );
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to send test digest email.'),
        ),
      );
    }
  }, [customerUuid, dispatch]);

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, values }) => (
        <form onSubmit={handleSubmit}>
          <FormGroup label={translate('Enable digest emails')}>
            <Field
              name="is_enabled"
              component={AwesomeCheckboxField as any}
              label={translate(
                'Send periodic summary emails to project members',
              )}
            />
          </FormGroup>

          {values.is_enabled && (
            <>
              <FormGroup label={translate('Frequency')} required>
                <Field
                  name="frequency"
                  component={SelectField as any}
                  options={frequencyOptions}
                  simpleValue
                  isClearable={false}
                />
              </FormGroup>

              {(values.frequency === 'weekly' ||
                values.frequency === 'biweekly') && (
                <FormGroup label={translate('Day of week')} required>
                  <Field
                    name="day_of_week"
                    component={SelectField as any}
                    options={dayOfWeekOptions}
                    simpleValue
                    isClearable={false}
                  />
                </FormGroup>
              )}

              {values.frequency === 'monthly' && (
                <FormGroup
                  label={translate('Day of month')}
                  description={translate(
                    'Day of the month to send the digest (1-28).',
                  )}
                  required
                >
                  <Field
                    name="day_of_month"
                    component={NumberField as any}
                    min={1}
                    max={28}
                  />
                </FormGroup>
              )}

              {availableSections.length > 0 && (
                <FormGroup
                  label={translate('Sections to include')}
                  description={translate(
                    'Select which sections to include in the digest. Leave all unchecked to include all sections.',
                  )}
                >
                  {availableSections.map((section) => (
                    <Field
                      key={section.key}
                      name="enabled_sections"
                      render={({ input }) => (
                        <FormCheck
                          className="form-check-custom mb-2"
                          type="checkbox"
                          id={`section-${section.key}`}
                          label={section.title}
                          checked={
                            Array.isArray(values.enabled_sections) &&
                            values.enabled_sections.includes(section.key)
                          }
                          onChange={(e) => {
                            const currentSections = Array.isArray(
                              values.enabled_sections,
                            )
                              ? [...values.enabled_sections]
                              : [];
                            if (e.target.checked) {
                              currentSections.push(section.key);
                            } else {
                              const idx = currentSections.indexOf(section.key);
                              if (idx >= 0) currentSections.splice(idx, 1);
                            }
                            input.onChange(currentSections);
                          }}
                        />
                      )}
                    />
                  ))}
                </FormGroup>
              )}
            </>
          )}

          <div className="d-flex gap-3">
            <SubmitButton
              submitting={submitting}
              disabled={pristine}
              label={translate('Save')}
            />
            {config?.is_enabled && (
              <SubmitButton
                submitting={false}
                type="button"
                variant="secondary"
                onClick={handleSendTest}
                label={translate('Send test email')}
              />
            )}
          </div>
        </form>
      )}
    />
  );
};
