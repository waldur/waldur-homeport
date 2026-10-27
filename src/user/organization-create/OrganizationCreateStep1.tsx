import { InfoIcon } from '@phosphor-icons/react';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Card } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { BlankEnum, ValidationMethodEnum } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import {
  getValidationMethodInfo,
  getValidationMethodOptions,
} from './constants';
import { PersonIdentifierFieldConfig } from './PersonIdentifierFieldsRenderer';
import { OrganizationCreateFormValues } from './types';
import { fetchPersonIdentifierFields } from './utils';

interface OrganizationCreateStep1Props {
  onFieldConfigFetched?: (config: PersonIdentifierFieldConfig | null) => void;
}

export const OrganizationCreateStep1: FunctionComponent<
  OrganizationCreateStep1Props
> = (props) => {
  const form = useForm();
  const { values } = useFormState<OrganizationCreateFormValues>({
    subscription: { values: true },
  });
  const { showError } = useNotify();

  const rawMethod = values.validationMethod || '';
  const validationMethod = rawMethod as ValidationMethodEnum | BlankEnum;

  const [fieldConfig, setFieldConfig] =
    useState<PersonIdentifierFieldConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const validationMethodOptions = useMemo(() => {
    const methods = ENV.plugins.WALDUR_CORE.ONBOARDING_VALIDATION_METHODS || [];
    return getValidationMethodOptions(methods);
  }, []);

  // Fetch person identifier fields when validation method changes
  const fetchFields = useCallback(
    async (method: ValidationMethodEnum | 'manual') => {
      if (!method || method === 'manual') {
        setFieldConfig(null);
        if (props.onFieldConfigFetched) {
          props.onFieldConfigFetched(null);
        }
        return;
      }

      setLoading(true);
      try {
        const config = await fetchPersonIdentifierFields(method);
        if (config === null) {
          showError(
            translate(
              'Person identifier fields are not configured for this validation method. Please contact administrators.',
            ),
          );
        }
        setFieldConfig(config);
        if (props.onFieldConfigFetched) {
          props.onFieldConfigFetched(config);
        }
      } catch {
        showError(
          translate(
            'Failed to fetch person identifier fields. Please try again or contact administrators.',
          ),
        );
        setFieldConfig(null);
        if (props.onFieldConfigFetched) {
          props.onFieldConfigFetched(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update form when field config changes
  useEffect(() => {
    form.change('personIdentifierFieldConfig', fieldConfig);
  }, [fieldConfig, form]);

  // Fetch fields when validation method changes
  useEffect(() => {
    if (validationMethod && typeof validationMethod === 'string') {
      fetchFields(validationMethod);
    }
  }, [validationMethod]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-6">
          <h4 className="mb-3">{translate('Select verification method')}</h4>
          <p className="text-secondary mb-5">
            {translate(
              'Choose how you would like to verify your organization. Automatic verification provides instant results if your company is registered in the selected business register.',
            )}
          </p>

          <SelectGroup
            name="validationMethod"
            label={translate('Verification method')}
            required
            validate={required}
            description={translate(
              'How would you like to verify your company?',
            )}
            simpleValue
            options={validationMethodOptions}
            placeholder={translate('Select a verification method')}
            isClearable={false}
          />

          {loading && (
            <div className="mt-3">
              <LoadingSpinner />
              <p className="text-center text-quaternary mt-1.5">
                {translate('Loading required fields...')}
              </p>
            </div>
          )}

          {!loading &&
            validationMethod &&
            (() => {
              const methodInfo = getValidationMethodInfo(validationMethod);

              return (
                <Card className="card-bordered">
                  <Card.Body className="flex gap-2.5">
                    <div className="shrink-0">
                      <InfoIcon size={24} weight="duotone" />
                    </div>
                    <div className="grow">
                      <div className="text-primary mb-1">
                        {methodInfo.title}
                      </div>
                      <div className="text-secondary">
                        {methodInfo.description}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              );
            })()}
        </Card.Body>
      </Card>
    </div>
  );
};
