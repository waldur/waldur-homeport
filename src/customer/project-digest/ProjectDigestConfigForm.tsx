import { FC, useEffect, useMemo } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Field, Form, FormSpy } from 'react-final-form';
import {
  customersUpdateProjectDigestConfigUpdate,
  ProjectDigestConfigRequest,
} from 'waldur-js-client';

import { BooleanGroup, SelectGroup, NumberGroup } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ProjectDigestConfig } from './api';

export interface DigestFormState {
  submitting: boolean;
  pristine: boolean;
  isEnabled: boolean;
}

interface ProjectDigestConfigFormProps {
  config: ProjectDigestConfig;
  customerUuid: string;
  onUpdated: () => void;
  onFormStateChange?: (state: DigestFormState) => void;
}

export const DIGEST_FORM_ID = 'digest-config-form';

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

const FormStateNotifier: FC<{
  onChange: (state: DigestFormState) => void;
}> = ({ onChange }) => (
  <FormSpy subscription={{ submitting: true, pristine: true, values: true }}>
    {({ submitting, pristine, values }) => {
      useEffect(() => {
        onChange({ submitting, pristine, isEnabled: !!values.is_enabled });
      }, [submitting, pristine, values.is_enabled, onChange]);
      return null;
    }}
  </FormSpy>
);

export const ProjectDigestConfigForm: FC<ProjectDigestConfigFormProps> = ({
  config,
  customerUuid,
  onUpdated,
  onFormStateChange,
}) => {
  const frequencyOptions = useMemo(
    () => FREQUENCY_OPTIONS.map((o) => ({ value: o.value, label: o.label() })),
    [],
  );

  const dayOfWeekOptions = useMemo(
    () =>
      DAY_OF_WEEK_OPTIONS.map((o) => ({ value: o.value, label: o.label() })),
    [],
  );

  const initialValues = useMemo(() => {
    let sections: string[] = [];
    if (Array.isArray(config?.enabled_sections)) {
      sections = config.enabled_sections;
    } else if (typeof config?.enabled_sections === 'string') {
      try {
        const parsed = JSON.parse(config.enabled_sections);
        sections = Array.isArray(parsed) ? parsed : [];
      } catch {
        sections = [];
      }
    }
    return {
      is_enabled: config?.is_enabled ?? false,
      frequency: config?.frequency ?? 'monthly',
      enabled_sections: sections,
      day_of_week: config?.day_of_week ?? 1,
      day_of_month: config?.day_of_month ?? 1,
    };
  }, [config]);

  const availableSections = config?.available_sections ?? [];

  const onSubmitMutation = useManagedMutation<
    any,
    any,
    ProjectDigestConfigRequest
  >({
    mutationFn: (values) =>
      customersUpdateProjectDigestConfigUpdate({
        path: { uuid: customerUuid },
        body: values,
      }),
    successMessage: translate('Digest configuration updated successfully.'),
    errorMessage: translate('Unable to update digest configuration.'),
    onSuccess: onUpdated,
  });

  return (
    <Form
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, values }) => (
        <form id={DIGEST_FORM_ID} onSubmit={handleSubmit}>
          {onFormStateChange && (
            <FormStateNotifier onChange={onFormStateChange} />
          )}
          <BooleanGroup
            name="is_enabled"
            checkboxLabel={translate(
              'Send periodic summary emails to project members',
            )}
            label={translate('Enable digest emails')}
          />

          {values.is_enabled && (
            <>
              <SelectGroup
                name="frequency"
                options={frequencyOptions}
                simpleValue
                isClearable={false}
                label={translate('Frequency')}
                required
              />

              {(values.frequency === 'weekly' ||
                values.frequency === 'biweekly') && (
                <SelectGroup
                  name="day_of_week"
                  options={dayOfWeekOptions}
                  simpleValue
                  isClearable={false}
                  label={translate('Day of week')}
                  required
                />
              )}

              {values.frequency === 'monthly' && (
                <NumberGroup
                  name="day_of_month"
                  min={1}
                  max={28}
                  label={translate('Day of month')}
                  description={translate(
                    'Day of the month to send the digest (1-28).',
                  )}
                  required
                />
              )}

              {availableSections.length > 0 && (
                <FormGroup
                  label={translate('Sections to include')}
                  description={translate(
                    'Select which sections to include in the digest. Leave all unchecked to include all sections.',
                  )}
                >
                  <Field
                    name="enabled_sections"
                    render={({ input }) => (
                      <>
                        {availableSections.map((section) => (
                          <FormCheck
                            key={section.key}
                            className="form-check-custom mb-2"
                            type="checkbox"
                            id={`section-${section.key}`}
                            label={section.title}
                            checked={
                              Array.isArray(input.value) &&
                              input.value.includes(section.key)
                            }
                            onChange={(e) => {
                              const currentSections = Array.isArray(input.value)
                                ? [...input.value]
                                : [];
                              if (e.target.checked) {
                                currentSections.push(section.key);
                              } else {
                                const idx = currentSections.indexOf(
                                  section.key,
                                );
                                if (idx >= 0) currentSections.splice(idx, 1);
                              }
                              input.onChange(currentSections);
                            }}
                          />
                        ))}
                      </>
                    )}
                  />
                </FormGroup>
              )}
            </>
          )}
        </form>
      )}
    />
  );
};
