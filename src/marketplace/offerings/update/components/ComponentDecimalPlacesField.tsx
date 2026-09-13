import React from 'react';
import { useFormState } from 'react-final-form';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

interface Values {
  limit_decimal_places?: number;
}

/**
 * How many decimal places a customer may request for this component's limit.
 *
 * Zero -- the default -- keeps the component whole-number only, which is what
 * every backend that maps a limit onto an integer quota requires. Raising it is
 * refused for plugins that declare they cannot hold a fraction, so the field is
 * offered everywhere and validated server-side rather than hidden per type.
 *
 * One plugin cannot declare that: the site agent's single offering type fronts
 * many backends, and they disagree about whether a limit can hold a fraction.
 * For those the backend sends an advisory instead of a refusal, already
 * phrased -- naming the backend the agent reports -- so the decision stays with
 * the provider and the list of backends stays server-side.
 */
export const ComponentDecimalPlacesField: React.FC<{
  offering?: ProviderOfferingDetails;
}> = ({ offering }) => {
  const { values } = useFormState<Values>();
  // Only once the provider has actually asked for a fraction: the advisory is
  // about a precision that is set, not about the default.
  const showAdvisory =
    Boolean(offering?.limit_precision_advisory) &&
    Number(values.limit_decimal_places) > 0;

  return (
    <>
      <NumberGroup
        name="limit_decimal_places"
        min={0}
        max={2}
        step={1}
        label={translate('Decimal places')}
        description={translate(
          'How many decimal places a customer may use for this limit. 0 keeps it a whole number.',
        )}
        spaceless
      />
      {showAdvisory && (
        <AlertItem
          variant="warning"
          className="mt-3"
          title={translate('The backend may not keep this precision')}
          body={offering.limit_precision_advisory}
        />
      )}
    </>
  );
};
