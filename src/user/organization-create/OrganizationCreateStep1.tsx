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

import { getValidationMethodInfo } from './constants';
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

  const validationMethod = (values.validationMethod || '') as
    | ValidationMethodEnum
    | BlankEnum;

  const [fieldConfig, setFieldConfig] =
    useState<PersonIdentifierFieldConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const validationMethodOptions = useMemo(() => {
    const methods = ENV.plugins.WALDUR_CORE.ONBOARDING_VALIDATION_METHODS || [];

    // Map method names to user-friendly labels
    const methodLabels = {
      ariregister: translate('Estonian Business Register (Äriregister)'),
      wirtschaftscompass: translate(
        'Austrian Business Register (WirtschaftsCompass)',
      ),
      bolagsverket: translate(
        'Swedish Companies Registration Office (Bolagsverket)',
      ),
      manual: translate('Manual verification'),
    };

    // Always include manual as the last option
    const allMethods = [...methods, 'manual'];

    return allMethods.map((method) => ({
      value: method,
      label: methodLabels[method] || method,
    }));
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
    <div className="d-flex flex-column gap-5">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-8">
          <h4 className="mb-4">{translate('Select verification method')}</h4>
          <p className="text-gray-700 mb-6">
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
            <div className="mt-4">
              <LoadingSpinner />
              <p className="text-center text-muted mt-2">
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
                  <Card.Body className="d-flex gap-3">
                    <div className="flex-shrink-0">
                      <InfoIcon size={24} weight="duotone" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-gray-800 mb-1">
                        {methodInfo.title}
                      </div>
                      <div className="text-gray-700">
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
