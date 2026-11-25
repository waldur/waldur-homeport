import { useFormState } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import { formatOptionWithDescription } from '../formatOptionWithDescription';

import {
  FIELD_TYPES,
  getFormulaOrderOptions,
  getK8sConfigOrderOptions,
  getPairedFormulaDescription,
  ORDER_ONLY_FIELD_TYPES,
  RESOURCE_ONLY_FIELD_TYPES,
} from './constants';

/**
 * The option types offered on each tab. On the resource options tab a
 * Component Formula only makes sense paired with a formula order option, so it
 * is offered when there is one, described for that role. Kubernetes Egress
 * Rules pair with the offering's one Kubernetes configuration order option.
 */
export const getOptionTypes = (resourceType, offering) => {
  if (resourceType !== 'resource_options') {
    return FIELD_TYPES.filter(
      (type) => !RESOURCE_ONLY_FIELD_TYPES.includes(type.value),
    );
  }
  const canPair = getFormulaOrderOptions(offering).length > 0;
  const canPairEgress = getK8sConfigOrderOptions(offering).length === 1;
  return FIELD_TYPES.filter(
    (type) =>
      !ORDER_ONLY_FIELD_TYPES.includes(type.value) &&
      (type.value !== 'component_formula' || canPair) &&
      (type.value !== 'k8s_egress_rules' || canPairEgress),
  ).map((type) =>
    type.value === 'component_formula'
      ? { ...type, description: getPairedFormulaDescription() }
      : type,
  );
};

export const OptionTypeGroup = ({
  resourceType,
  offering,
}: {
  resourceType?: 'options' | 'resource_options';
  offering?;
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const types = getOptionTypes(resourceType, offering);
  const selected = types.find((type) => type.value === values.type?.value);
  return (
    <SelectGroup
      name="type"
      label={translate('Type')}
      description={selected?.description}
      required={true}
      validate={required}
      options={types}
      formatOptionLabel={formatOptionWithDescription}
      isClearable={false}
    />
  );
};
