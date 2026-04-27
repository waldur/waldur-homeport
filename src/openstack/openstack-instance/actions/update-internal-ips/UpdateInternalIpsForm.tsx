import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useCallback, useMemo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useToggle } from 'react-use';
import { Field, FieldArray } from 'redux-form';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { required } from '@/core/validators';
import { FormGroup, SelectField } from '@/form';
import { translate } from '@/i18n';
import {
  CustomIpField,
  SubnetValueContainer,
} from '@/openstack/openstack-instance/deploy/FormNetworkSecurityStep';
import { formatSubnet } from '@/openstack/openstack-instance/utils';
import { AsyncActionDialog } from '@/resource/actions/AsyncActionDialog';
import { ActionButton } from '@/table/ActionButton';

import { connectForm } from './utils';

const PortRows = ({ fields, subnets, hasCustomIp }: any) => {
  const availableSubnetsFilter = useCallback(
    (item) => {
      for (let i = 0; i < fields.length; i++) {
        const port = fields.get(i);
        if (port?.subnet?.uuid === item.uuid) return false;
      }
      return true;
    },
    [fields],
  );

  const freeSubnets = useMemo(
    () =>
      subnets.filter(availableSubnetsFilter).map((subnet) => ({
        ...subnet,
        label: formatSubnet(subnet),
      })),
    [subnets, availableSubnetsFilter],
  );

  const addRow = useCallback(() => {
    if (freeSubnets.length > 0) {
      fields.push({ subnet: freeSubnets[0] });
    }
  }, [fields, freeSubnets]);

  return (
    <div className="mb-5">
      <div className="border-rows mb-4">
        {fields.map((port, index) => (
          <Fragment key={index}>
            <Row className="g-4">
              <Col sm>
                <Field
                  name={`${port}.subnet`}
                  label={translate('Subnet')}
                  component={FormGroup}
                  options={freeSubnets}
                  validate={[required]}
                  required={true}
                  placeholder={translate('Select subnet')}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.name}
                  noUpdateOnBlur
                  spaceless
                  components={{ ValueContainer: SubnetValueContainer }}
                >
                  <SelectField />
                </Field>
              </Col>
              <Col xs="auto" className="align-self-end">
                <ActionButton
                  action={() => fields.remove(index)}
                  iconNode={<TrashIcon weight="bold" />}
                  variant="text-danger"
                />
              </Col>
              {hasCustomIp && (
                <Col xs={12}>
                  <Col sm={6}>
                    <CustomIpField
                      parentName={port}
                      data={fields.get(index)}
                      hasAutoOption
                    />
                  </Col>
                </Col>
              )}
            </Row>
          </Fragment>
        ))}
      </div>
      <ActionButton
        action={addRow}
        disabled={freeSubnets.length === 0}
        tooltip={
          freeSubnets.length === 0
            ? translate('No more subnets available')
            : undefined
        }
        title={translate('Add subnet')}
        iconNode={<PlusCircleIcon weight="bold" />}
        variant="text-primary"
      />
    </div>
  );
};

export const UpdateInternalIpsForm = connectForm(
  ({
    handleSubmit,
    submitting,
    invalid,
    submitRequest,
    asyncState,
    resource,
  }) => {
    const [hasCustomIp, toggleCustomIp] = useToggle(false);

    return (
      <form onSubmit={handleSubmit(submitRequest)}>
        <AsyncActionDialog
          title={translate(
            'Update internal IPs for OpenStack instance {name}',
            {
              name: resource.name,
            },
          )}
          loading={asyncState.loading}
          error={asyncState.error}
          submitting={submitting}
          invalid={invalid}
        >
          {asyncState.value ? (
            <Form.Group>
              <div className="d-flex justify-content-between mb-5">
                <Form.Label className="mb-0">
                  {translate('Connected subnets')}
                </Form.Label>
                <AwesomeCheckbox
                  value={hasCustomIp}
                  onChange={toggleCustomIp}
                  size="sm"
                  className="align-self-center"
                  label={translate('Custom IP configuration')}
                />
              </div>
              <FieldArray
                name="ports"
                component={PortRows}
                subnets={asyncState.value}
                hasCustomIp={hasCustomIp}
              />
            </Form.Group>
          ) : null}
        </AsyncActionDialog>
      </form>
    );
  },
);
