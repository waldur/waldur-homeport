import { PublicOfferingDetails } from 'waldur-js-client';

import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

/**
 * The offering's usage-based components as select options: the ones a
 * resource option can be shown as the limit of.
 */
export const getUsageComponentOptions = (offering?: PublicOfferingDetails) =>
  (offering?.components || [])
    .filter((component) => component.billing_type === 'usage')
    .map((component) => ({
      value: component.type,
      label: `${component.name} (${component.type})`,
    }));

interface DisplayLimitConfigurationProps {
  offering?: PublicOfferingDetails;
}

/**
 * Lets an integer resource option be shown as the limit of a usage-based
 * component. The value is only displayed next to the usage; it is not billed
 * or enforced. Offerings without usage-based components have nothing to pick.
 */
export const DisplayLimitConfiguration = ({
  offering,
}: DisplayLimitConfigurationProps) => {
  const componentOptions = getUsageComponentOptions(offering);
  if (!componentOptions.length) {
    return null;
  }
  return (
    <SelectGroup
      name="display_limit_config.component_type"
      label={translate('Show as limit of')}
      description={translate(
        "Show this option's value as the limit of a usage-based component on the resource page. The value is not billed or enforced.",
      )}
      options={componentOptions}
      isClearable
      placeholder={translate('Not shown as a limit')}
      getOptionValue={(option) => option.value}
      getOptionLabel={(option) => option.label}
      simpleValue
    />
  );
};
