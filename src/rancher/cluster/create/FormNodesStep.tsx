import { PlusIcon, XIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useCallback } from 'react';
import { Form, FormCheck } from 'react-bootstrap';
import { Field, useForm } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { rancherClusterTemplatesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { SelectField, SelectGroup, StringField } from '@/form';
import { BoxNumberField } from '@/form/BoxNumberField';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { VStepperFormStepCard } from '@/wizard';

import { NODES_FIELD_ARRAY } from './constants';
import { RANCHER_NODE_ROLES } from './RANCHER_NODE_ROLES';
import { filterFlavors, useFormTenant, useVolumeDataLoader } from './utils';

import './FormNodesStep.scss';

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

const BooleanGroup = ({ groupName, options, input, groupClassName }) => (
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
          checked={(input.value || []).indexOf(option.name) !== -1}
          onChange={(e) => {
            const newValue = [...(input.value || [])];
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
      name: translate('Rancher node {index}', { index: fields.length + 1 }),
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
                          <Field name={`${node}.name`} validate={required}>
                            {({ input, meta }) => (
                              <StringField
                                input={input}
                                meta={meta}
                                placeholder={translate('Node name')}
                                required={true}
                              />
                            )}
                          </Field>
                        </td>
                        <td>
                          <Field
                            name={`${node}.units`}
                            validate={required}
                            parse={parseIntField}
                            format={formatIntField}
                          >
                            {({ input, meta }) => (
                              <BoxNumberField
                                input={input}
                                meta={meta}
                                min={1}
                                max={100}
                                required={true}
                              />
                            )}
                          </Field>
                        </td>
                        <td>
                          <Field name={`${node}.flavor`} validate={required}>
                            {({ input, meta }) => (
                              <SelectField
                                input={input}
                                meta={meta}
                                placeholder={translate('Select flavor...')}
                                options={flavors}
                                isClearable={true}
                              />
                            )}
                          </Field>
                        </td>
                        <td colSpan={3}>
                          <Field name={`${node}.roles`} validate={required}>
                            {(fieldProps) => (
                              <BooleanGroup
                                groupName={`${node}.roles`}
                                options={RANCHER_NODE_ROLES}
                                groupClassName="d-flex justify-content-around node-roles"
                                input={fieldProps.input}
                              />
                            )}
                          </Field>
                        </td>
                        <td>
                          <ActionButton
                            variant="text-danger"
                            action={() => fields.remove(index)}
                            iconNode={<XIcon weight="bold" />}
                          />
                        </td>
                      </tr>
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <ActionButton
        variant="tertiary"
        className="text-nowrap"
        action={addRow}
        iconNode={<PlusIcon weight="bold" />}
        title={translate('Add')}
      />
    </>
  );
};

export const FormNodesStep = (props: FormStepProps) => {
  const { confirm } = useModal();
  const form = useForm();

  const tenant = useFormTenant();

  const { data: volumeData } = useVolumeDataLoader(tenant);
  const { data: templates, isLoading: templateLoading } = useQuery({
    queryKey: ['nodes-step-templates'],

    queryFn: () =>
      getAllPages((page) =>
        rancherClusterTemplatesList({
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ),

    staleTime: UI_STALE_TIME,
  });
  const { data: flavors, isLoading } = useQuery({
    queryKey: ['nodes-step-flavors', tenant?.url, props.offering.uuid],

    queryFn: () =>
      tenant && props.offering
        ? filterFlavors(tenant.uuid, props.offering)
        : [],

    staleTime: UI_STALE_TIME,
  });

  const onSelectTemplate = useCallback(
    (template) => {
      if (!template) {
        return;
      }

      confirm(
        translate('Confirmation'),
        translate(
          'Are you sure you want to select template? Note this will reset the node plan.',
        ),
      ).then(() => {
        form.change('attributes.template', template);
        const nodes = (template.nodes || []).map((node, i) => {
          const _flavors = flavors
            ? flavors.filter((flavor) => filterFlavor(node, flavor))
            : [];
          const flavor = _flavors.length > 0 ? _flavors[0] : undefined;
          const preferredVolumeType =
            node.preferred_volume_type && volumeData?.volumeTypeChoices
              ? volumeData.volumeTypeChoices.find(
                  (option) => option.name === node.preferred_volume_type,
                )
              : undefined;
          return {
            name: translate('Rancher node {index}', { index: i + 1 }),
            units: 1,
            roles: node.roles,
            system_volume_size: node.system_volume_size,
            system_volume_type: preferredVolumeType
              ? preferredVolumeType.value
              : undefined,
            flavor,
          };
        });
        form.change(NODES_FIELD_ARRAY, nodes);
      });
    },
    [flavors, volumeData, form],
  );

  return (
    <VStepperFormStepCard
      title={translate('Nodes')}
      id={props.id}
      loading={isLoading || templateLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      className="step-nodes"
    >
      {flavors && flavors.length > 0 ? (
        <>
          {templates && templates.length > 0 ? (
            <SelectGroup
              name="attributes.template"
              label={translate('Template')}
              options={templates}
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              onChange={onSelectTemplate}
            />
          ) : null}
          <FieldArray
            name={NODES_FIELD_ARRAY}
            component={renderNodeRows}
            flavors={flavors}
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
