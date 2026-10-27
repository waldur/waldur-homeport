import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { BaseButton, FormField, FormLabel, FormText } from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import {
  getDefaultAllocationPool,
  validateAllocationPool,
} from '../openstack-network/utils';

const AllocationPoolsList: FunctionComponent<
  FieldArrayRenderProps<any, any>
> = ({ fields, meta }) => {
  const { values } = useFormState();
  const cidr = values.cidr;
  const form = useForm();
  const prevCidrRef = useRef<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (!cidr) return;

    let isMounted = true;
    setTimeout(() => {
      if (isMounted && fields.length === 0) {
        const defaultPool = getDefaultAllocationPool(cidr);
        fields.push(defaultPool);
      }
    }, 0);

    return () => {
      isMounted = false;
    };
  }, [fields, cidr]);

  useEffect(() => {
    if (!cidr) return;

    if (
      prevCidrRef.current &&
      prevCidrRef.current !== cidr &&
      fields.length > 0
    ) {
      const defaultPool = getDefaultAllocationPool(cidr);

      for (let i = 0; i < fields.length; i++) {
        form.change(`allocation_pools[${i}].start`, defaultPool.start);
        form.change(`allocation_pools[${i}].end`, defaultPool.end);
      }

      setValidationErrors({});
    }

    prevCidrRef.current = cidr;
  }, [cidr, form, fields]);

  const validateField = (
    value: string,
    index: number,
    field: 'start' | 'end',
  ) => {
    if (!cidr) return;

    const currentValues = fields.value || [];
    if (!currentValues[index]) return;

    const pool = {
      ...currentValues[index],
      [field]: value,
    };

    if (pool.start && pool.end) {
      const validationResult = validateAllocationPool(pool, cidr);

      if (validationResult) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`${index}-start`];
          delete newErrors[`${index}-end`];
          newErrors[`${index}-${validationResult.field}`] =
            validationResult.error;
          return newErrors;
        });
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`${index}-start`];
          delete newErrors[`${index}-end`];
          return newErrors;
        });
      }
    }
  };

  const addPool = () => {
    const defaultPool = cidr
      ? getDefaultAllocationPool(cidr)
      : { start: '', end: '' };
    fields.push(defaultPool);
  };

  return (
    <>
      {fields.length === 0 && (
        <p className="text-quaternary">
          {translate('No allocation pools defined. Default pool will be used.')}
        </p>
      )}
      {fields.map((name, index) => (
        <div key={index} className="mb-2.5">
          <div className="flex items-center gap-1.5">
            <Field name={`${name}.start`} type="text">
              {({ input }) => (
                <BaseInputField
                  {...input}
                  containerClassName="flex-1"
                  placeholder={translate('Start IP')}
                  onChange={(e) => {
                    input.onChange(e);
                    validateField(e.target.value, index, 'start');
                  }}
                />
              )}
            </Field>

            <span className="text-quaternary">-</span>
            <Field name={`${name}.end`} type="text">
              {({ input }) => (
                <BaseInputField
                  {...input}
                  containerClassName="flex-1"
                  placeholder={translate('End IP')}
                  onChange={(e) => {
                    input.onChange(e);
                    validateField(e.target.value, index, 'end');
                  }}
                />
              )}
            </Field>

            <RemovalActionButton
              action={() => {
                fields.remove(index);
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[`${index}-start`];
                  delete newErrors[`${index}-end`];
                  return newErrors;
                });
              }}
              tooltip={translate('Remove')}
            />
          </div>
          {validationErrors[`${index}-start`] && (
            <div className="text-danger small mt-1">
              {validationErrors[`${index}-start`]}
            </div>
          )}
          {validationErrors[`${index}-end`] && (
            <div className="text-danger small mt-1">
              {validationErrors[`${index}-end`]}
            </div>
          )}
        </div>
      ))}
      <div className="mb-2.5">
        <BaseButton
          onClick={addPool}
          label={translate('Add allocation pool')}
          iconNode={<PlusCircleIcon weight="bold" />}
          variant="tertiary"
          size="sm"
        />
      </div>
      {meta.error && meta.submitFailed && (
        <div className="text-danger">{meta.error}</div>
      )}
    </>
  );
};

export const InternalNetworkAllocationPool: FunctionComponent = () => (
  <FormField>
    <FormLabel>{translate('Internal network allocation pool')}</FormLabel>
    <FieldArray name="allocation_pools" component={AllocationPoolsList} />
    <FormText variant="muted">
      {translate(
        'Define IP range that will be used for automatic assignment to instances.',
      )}
    </FormText>
  </FormField>
);
