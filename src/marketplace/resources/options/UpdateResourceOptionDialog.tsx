import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceResourcesUpdateOptions,
  OptionField,
  Resource,
} from 'waldur-js-client';
import { Offering } from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import { getDerivedLimitInputs } from '@/marketplace/common/derivedLimits';
import {
  ALL_MODELS,
  getAllModelsOption,
} from '@/marketplace/common/modelSelection';
import { splitOptionErrors } from '@/marketplace/common/optionErrors';
import { OptionsForm } from '@/marketplace/common/OptionsForm';
import { findResourcePlan } from '@/marketplace/details/plan/effectiveComponents';
import {
  getIncreaseOnlyFloors,
  mayLowerIncreaseOnlyLimits,
} from '@/marketplace/resources/change-limits/utils';
import { ActionDialogFinal } from '@/modal/ActionDialogFinal';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { FormulaChangePreview } from './FormulaChangePreview';

export interface UpdateResourceOptionDialogProps {
  resolve: {
    resource: Resource;
    offering: Offering;
    option: OptionField & { name: string };
    refetch?;
  };
}

export const UpdateResourceOptionDialog: FC<UpdateResourceOptionDialogProps> = (
  props,
) => {
  const { name, ...option } = props.resolve.option;
  const isFormula = option.type === 'component_formula';
  const offering = props.resolve.offering;
  const allModelsOption = getAllModelsOption(offering?.resource_options);
  const user = useUser();
  const resource = props.resolve.resource;
  // The limits a customer may only raise: a new value that would derive a
  // lower one is refused, unless the user is the provider or staff.
  const mayLower = mayLowerIncreaseOnlyLimits(user, resource ?? {});
  const derivedFloors = useMemo(
    () =>
      isFormula && !mayLower && offering
        ? getIncreaseOnlyFloors(
            offering,
            findResourcePlan(offering.plans, resource?.plan_uuid),
            (resource?.limits ?? {}) as Record<string, number>,
          )
        : undefined,
    [isFormula, mayLower, offering, resource],
  );
  const options = useMemo(() => {
    return {
      // The card only offers options that are visible for the resource's
      // current values, and this dialog edits that one option alone, so its
      // visibility rule (which refers to another option) does not apply here.
      options: {
        [name]: {
          ...option,
          required: false,
          visible_if: undefined,
          // A paired formula option has no formulas of its own: the order
          // option's are what the value is checked against.
          ...(isFormula
            ? {
                component_formula_config:
                  offering?.options?.options?.[name]?.component_formula_config,
              }
            : {}),
        },
      },
      order: [name],
    };
  }, [name, option, isFormula, offering]);

  // The dialog holds this one option; an IPsec option names others, such
  // as the cidr options its subnets keep clear of.
  const optionLabels = useMemo(
    () =>
      Object.fromEntries(
        [offering?.options, offering?.resource_options].flatMap((set) =>
          Object.entries(set?.options || {}).map(([key, other]) => [
            key,
            other?.label || key,
          ]),
        ),
      ),
    [offering],
  );

  const initialValues = useMemo(
    () => ({
      attributes: {
        [name]: isFormula
          ? // Ordered before the option existed: the ordered value.
            (getDerivedLimitInputs(props.resolve.resource, offering)[name] ??
            null)
          : name === allModelsOption &&
              // An unset single choice, kept when the option became a
              // multiple one, is stored as ''.
              (props.resolve.resource?.options?.[name] ?? '') === ''
            ? // A resource that never chose its models is on every model.
              [ALL_MODELS]
            : (props.resolve.resource?.options?.[name] ?? null),
      },
      // The networks an IPsec option's remote subnets must not overlap: the
      // resource's other options, and its ordered values. Not submitted.
      ...(option.type === 'ipsec_vpn_config'
        ? {
            networkContext: {
              ...(props.resolve.resource?.attributes as object),
              ...(props.resolve.resource?.options as object),
            },
          }
        : {}),
      // What the formula validator checks derived limits against; only the
      // attributes are submitted.
      ...(isFormula
        ? {
            offering,
            limits: props.resolve.resource?.limits,
            derivedInputs: getDerivedLimitInputs(
              props.resolve.resource,
              offering,
            ),
            derivedFallback: props.resolve.resource?.limits,
            derivedFloors,
            derivedPreview: true,
          }
        : {}),
    }),
    [
      name,
      isFormula,
      option.type,
      offering,
      props.resolve.resource,
      allModelsOption,
      derivedFloors,
    ],
  );

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceResourcesUpdateOptions({
        path: { uuid: props.resolve.resource.uuid },
        body: {
          options: formData.attributes,
        },
      }),
    successMessage: isFormula
      ? translate('The change has been submitted as an order.')
      : translate('Options have been updated'),
    errorMessage: translate('Unable to update options.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      onSubmit={async (values) => {
        try {
          await updateMutation.mutateAsync(values);
        } catch (error) {
          // useManagedMutation shows the toast; also put an error about this
          // option (such as a value already used by another resource) next
          // to the field. Mastermind nests it under the `options` field.
          const body = getErrorBody(error);
          const { attributes } = splitOptionErrors(
            body?.options && typeof body.options === 'object'
              ? body.options
              : body,
            [name],
          );
          if (Object.keys(attributes).length > 0) {
            return { attributes };
          }
          // A formula option is refused on the limits it derives, such as
          // one its provider allows only to grow: that is about this value.
          if (isFormula && body?.limits) {
            return { attributes: { [name]: body.limits } };
          }
        }
      }}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <ActionDialogFinal
          title={translate('Update option')}
          submitLabel={translate('Update')}
          onSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
        >
          {name ? (
            <>
              <OptionsForm
                options={options}
                offeringUuid={offering?.uuid}
                allModelsOption={allModelsOption}
                optionLabels={optionLabels}
              />
              {isFormula ? (
                <FormulaChangePreview
                  resource={props.resolve.resource}
                  name={name}
                />
              ) : null}
            </>
          ) : (
            translate('There are no resource options defined in the offering.')
          )}
        </ActionDialogFinal>
      )}
    />
  );
};
