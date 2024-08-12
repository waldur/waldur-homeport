import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useCallback } from 'react';
import { Button, Form, FormCheck } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { arrayPush, arrayRemoveAll, Field, FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormGroup, SelectField, StringField } from '@waldur/form';
import { BoxNumberField } from '@waldur/form/BoxNumberField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { StepCardPlaceholder } from '@waldur/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { waitForConfirmation } from '@waldur/modal/actions';
import { Flavor } from '@waldur/openstack/openstack-instance/types';
import { listClusterTemplates } from '@waldur/rancher/api';

import { NODES_FIELD_ARRAY } from './constants';
import { LonghornWorkerWarning } from './LonghornWorkerWarning';
import { formTenantSelector, loadFlavors, useVolumeDataLoader } from './utils';

import './FormNodesStep.scss';

const nodeRoles = [
  { name: 'etcd', label: translate('etcd') },
  { name: 'controlplane', label: translate('Control plane') },
  { name: 'worker', label: translate('Worker') },
];

const filterFlavor = (node, flavor) => {
  if (node.min_ram) {
    if (flavor.ram < node.min_ram * 1024) {
      return false;
    }
  }
  if (node.min_vcpu) {
    if (flavor.cores < node.min_vcpu) {
      return false;
    }
  }
  return true;
};

const CheckboxGroup = ({ groupName, options, input, groupClassName }) => (
  <Form.Group controlId={groupName} className={groupClassName}>
    {options.map((option, index) => (
      <FormCheck inline key={index}>
        <FormCheck.Label htmlFor={`${option.name}-checkbox-${index}`}>
          {option.label}
        </FormCheck.Label>
        <FormCheck.Input
          name={`${input.name}[${index}]`}
          id={`${option.name}-checkbox-${index}`}
          type="checkbox"
          value={option.name}
          checked={input.value.indexOf(option.name) !== -1}
          onChange={(e) => {
            const newValue = [...input.value];
            if (e.target.checked) {
              newValue.push(option.name);
            } else {
              newValue.splice(newValue.indexOf(option.name), 1);
            }
            return input.onChange(newValue);
          }}
        />
      </FormCheck>
    ))}
  </Form.Group>
);

const renderNodeRows = ({ fields, flavors }: any) => {
  const addRow = useCallback(() => {
    fields.push({
      name: translate('Rancher node ') + (fields.length + 1),
      roles: ['worker'],
      units: 1,
    });
  }, [fields]);

  return (
    <>
      {fields.length > 0 && (
        <Form.Group id="nodes-list-group">
          <div>
            <table className="table align-middle">
              <thead>
                <tr>
                  <th className="w-200px">{translate('Required nodes')}</th>
                  <th />
                  <th className="w-250px" />
                  <th className="w-100px text-center">1, 3 or 5</th>
                  <th className="w-100px text-center">1 or more</th>
                  <th className="w-100px text-center">1 or more</th>
                  <th className="w-5px" />
                </tr>
              </thead>
              <tbody>
                {fields.map((node, index) => {
                  return (
                    <Fragment key={node}>
                      <tr>
                        <td>
                          <Field
                            name={`${node}.name`}
                            required={true}
                            component={StringField}
                            placeholder={translate('Node name')}
                            validate={[required]}
                          />
                        </td>
                        <td>
                          <Field
                            name={`${node}.units`}
                            component={BoxNumberField}
                            validate={[required]}
                            required={true}
                            min={1}
                            max={100}
                          />
                        </td>
                        <td>
                          <Field
                            name={`${node}.flavor`}
                            component={SelectField}
                            placeholder={translate('Select flavor') + '...'}
                            options={flavors}
                            validate={required}
                            isClearable={true}
                          />
                        </td>
                        <td colSpan={3}>
                          <Field
                            name={`${node}.roles`}
                            groupName={`${node}.roles`}
                            component={CheckboxGroup}
                            options={nodeRoles}
                            groupClassName="d-flex justify-content-around node-roles"
                            validate={required}
                          />
                        </td>
                        <td>
                          <Button
                            variant="light"
                            className="btn-icon btn-active-light-danger"
                            onClick={() => fields.remove(index)}
                          >
                            <i className="fa fa-times fs-4" />
                          </Button>
                        </td>
                      </tr>
                      {typeof index === 'number' ? (
                        <tr>
                          <td colSpan={7}>
                            <LonghornWorkerWarning nodeIndex={index} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <Button variant="light" className="text-nowrap" onClick={addRow}>
        <span className="svg-icon svg-icon-2">
          <Plus />
        </span>
        {translate('Add')}
      </Button>
    </>
  );
};

export const FormNodesStep = (props: FormStepProps) => {
  const dispatch = useDispatch();
  const tenant = useSelector(formTenantSelector);

  const { data: volumeData } = useVolumeDataLoader(tenant);
  const { data: templates, isLoading: templateLoading } = useQuery(
    ['nodes-step-templates'],
    () => listClusterTemplates(),
    { staleTime: 3 * 60 * 1000 },
  );
  const { data: flavors, isLoading } = useQuery<{}, {}, Flavor[]>(
    ['nodes-step-flavors', tenant, props.offering.uuid],
    () => (tenant && props.offering ? loadFlavors(tenant, props.offering) : []),
    { staleTime: 3 * 60 * 1000 },
  );

  const onSelectTemplate = useCallback(
    (template) => {
      if (!template) {
        return;
      }

      waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to select template? Note this will reset the node plan.',
        ),
      ).then(() => {
        props.change('attributes.template', template);
        dispatch(arrayRemoveAll(ORDER_FORM_ID, NODES_FIELD_ARRAY));
        template.nodes.forEach((node, i) => {
          const _flavors = flavors.filter((flavor) =>
            filterFlavor(node, flavor),
          );
          const flavor = _flavors.length > 0 ? _flavors[0] : undefined;
          const preferredVolumeType = node.preferred_volume_type
            ? volumeData.volumeTypeChoices.find(
                (option) => option.name === node.preferred_volume_type,
              )
            : undefined;
          dispatch(
            arrayPush(ORDER_FORM_ID, NODES_FIELD_ARRAY, {
              name: translate('Rancher node ') + (i + 1),
              units: 1,
              roles: node.roles,
              system_volume_size: node.system_volume_size,
              system_volume_type: preferredVolumeType
                ? preferredVolumeType.value
                : undefined,
              flavor,
            }),
          );
        });
      });
    },
    [dispatch, flavors],
  );

  return (
    <VStepperFormStepCard
      title={translate('Nodes')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading || templateLoading}
      disabled={props.disabled}
      required={props.required}
      className="step-nodes"
    >
      {flavors && flavors.length > 0 ? (
        <>
          {templates && templates.length > 0 ? (
            <Field
              name="attributes.template"
              component={FormGroup}
              label={translate('Template')}
              onChange={onSelectTemplate}
            >
              <SelectField
                options={templates}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                isClearable={true}
              />
            </Field>
          ) : null}
          <FieldArray
            name={NODES_FIELD_ARRAY}
            component={renderNodeRows}
            flavors={flavors}
            rerenderOnEveryChange
          />
        </>
      ) : (
        <StepCardPlaceholder>
          {translate('Please select a tenant first')}
        </StepCardPlaceholder>
      )}
    </VStepperFormStepCard>
  );
};
