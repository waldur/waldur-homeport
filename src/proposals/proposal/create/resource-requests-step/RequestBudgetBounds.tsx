import { FC, useEffect, useMemo } from 'react';
import { Field, useForm } from 'react-final-form';
import { CallOfferingComponentBounds } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  findComponentRule,
  formatRuleBounds,
  getRuleBoundsValidator,
} from '@/proposals/budgets';

interface RequestBudgetBoundsProps {
  rules: CallOfferingComponentBounds[] | undefined;
  requestedOfferingUuid: string;
  components: { type: string; name?: string }[];
  limits?: Record<string, number>;
}

/**
 * What the call lets a request on this offering ask for, per component. A
 * fixed amount is set on the request: the call decides it, whatever is
 * typed. A component left empty starts from the call's default amount. A
 * bounded amount is also checked here: the amount rows only know the
 * offering's own limits, so a request inside those but outside the call's
 * rule would otherwise reach the backend before being refused.
 */
export const RequestBudgetBounds: FC<RequestBudgetBoundsProps> = ({
  rules,
  requestedOfferingUuid,
  components,
  limits,
}) => {
  const form = useForm();
  const rows = useMemo(
    () =>
      components
        .map((component) => {
          const rule = findComponentRule(
            rules,
            requestedOfferingUuid,
            component.type,
          );
          return {
            component,
            rule,
            bounds: formatRuleBounds(rule),
            validate: getRuleBoundsValidator(rule),
          };
        })
        .filter(({ rule }) => rule),
    [rules, requestedOfferingUuid, components],
  );

  useEffect(() => {
    rows.forEach(({ component, rule, validate }) => {
      const name = `limits.${component.type}`;
      const current = limits?.[component.type];
      if (rule.is_fixed) {
        if (current !== rule.default_amount) {
          form.change(name, rule.default_amount);
        }
      } else if (
        rule.default_amount !== null &&
        (current === undefined || current === null)
      ) {
        form.change(name, rule.default_amount);
      } else if (validate?.(current)) {
        // An amount saved before the rule tightened is wrong before anyone
        // types: the row shows its error only once the field is touched.
        form.blur(name);
      }
    });
  }, [rows, limits, form]);

  const shown = rows.filter(({ bounds }) => bounds);
  return (
    <>
      {/* Registered under the typed amount's own name: final-form runs every
          validator registered for a field and shows the first error on it.
          Keyed by the rule, so a changed rule re-registers and re-runs. */}
      {rows
        .filter(({ validate }) => validate)
        .map(({ component, rule, validate }) => (
          <Field
            key={`${rule.uuid}:${rule.min_per_proposal}:${rule.max_per_proposal}:${rule.measured_unit}`}
            name={`limits.${component.type}`}
            validate={validate}
            subscription={{}}
            render={() => null}
          />
        ))}
      {shown.length > 0 && (
        <div className="mb-4" data-testid="request-budget-bounds">
          <p className="font-medium mb-1">
            {translate('What the call allows')}
          </p>
          <ul className="mb-0 text-quaternary">
            {shown.map(({ component, rule, bounds }) => (
              <li key={component.type}>
                {component.name || component.type}: {bounds}
                {rule.is_fixed ? (
                  <> {translate('The amount cannot be changed.')}</>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
