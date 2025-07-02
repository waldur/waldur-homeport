import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { FieldArray, Field, formValueSelector, change } from 'redux-form';
import { FieldArrayFieldsProps, FieldArrayMetaProps } from 'redux-form';
import { OpenStackSubNetAllocationPool } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { RESOURCE_ACTION_FORM } from '@waldur/resource/actions/constants';
import { RootState } from '@waldur/store/reducers';

import {
  getDefaultAllocationPool,
  validateAllocationPool,
} from '../openstack-network/utils';

const selector = formValueSelector(RESOURCE_ACTION_FORM);
const cidrSelector = (state: RootState) => selector(state, 'cidr');

interface FieldArrayProps {
  fields: FieldArrayFieldsProps<OpenStackSubNetAllocationPool>;
  meta: FieldArrayMetaProps;
}

const AllocationPoolsList: FunctionComponent<FieldArrayProps> = ({
  fields,
  meta,
}) => {
  const cidr = useSelector(cidrSelector);
  const dispatch = useDispatch();
  const prevCidrRef = useRef<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (!cidr) return;

    if (fields.length === 0) {
      const defaultPool = getDefaultAllocationPool(cidr);
      fields.push(defaultPool);
    }
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
        dispatch(
          change(
            RESOURCE_ACTION_FORM,
            `allocation_pools[${i}].start`,
            defaultPool.start,
          ),
        );
        dispatch(
          change(
            RESOURCE_ACTION_FORM,
            `allocation_pools[${i}].end`,
            defaultPool.end,
          ),
        );
      }

      setValidationErrors({});
    }

    prevCidrRef.current = cidr;
  }, [cidr, dispatch, fields]);

  const validateField = (
    value: string,
    index: number,
    field: 'start' | 'end',
  ) => {
    if (!cidr) return;

    const currentValues = fields.getAll() || [];
    if (!currentValues[index]) return;

    const pool = {
      ...currentValues[index],
      [field]: value,
    };

    if (pool.start && pool.end) {
      const validationResult = validateAllocationPool(pool, cidr);

      if (validationResult) {
        setValidationErrors((prev) => ({
          ...prev,
          [`${index}-${validationResult.field}`]: validationResult.error,
        }));
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
        <p className="text-muted">
          {translate('No allocation pools defined. Default pool will be used.')}
        </p>
      )}

      {fields.map((pool, index) => (
        <div key={index} className="mb-3">
          <InputGroup>
            <Field
              name={`${pool}.start`}
              component="input"
              type="text"
              placeholder={translate('Start IP')}
              className="form-control"
              onChange={(e) => validateField(e.target.value, index, 'start')}
            />

            <InputGroup.Text>-</InputGroup.Text>
            <Field
              name={`${pool}.end`}
              component="input"
              type="text"
              placeholder={translate('End IP')}
              className="form-control"
              onChange={(e) => validateField(e.target.value, index, 'end')}
            />

            <Button
              variant="danger"
              onClick={() => {
                fields.remove(index);
                setValidationErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[`${index}-start`];
                  delete newErrors[`${index}-end`];
                  return newErrors;
                });
              }}
              title={translate('Remove')}
            >
              <TrashIcon />
            </Button>
          </InputGroup>
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

      <div className="mb-3">
        <Button size="sm" onClick={addPool}>
          <PlusCircleIcon /> {translate('Add allocation pool')}
        </Button>
      </div>

      {meta.error && meta.submitFailed && (
        <div className="text-danger">{meta.error}</div>
      )}
    </>
  );
};

export const InternalNetworkAllocationPool: FunctionComponent = () => (
  <Form.Group>
    <Form.Label>{translate('Internal network allocation pool')}</Form.Label>
    <FieldArray name="allocation_pools" component={AllocationPoolsList} />
    <Form.Text className="text-muted">
      {translate(
        'Define IP range that will be used for automatic assignment to instances.',
      )}
    </Form.Text>
  </Form.Group>
);
