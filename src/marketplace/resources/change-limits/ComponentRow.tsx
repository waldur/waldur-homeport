import { FC } from 'react';
import { Field as FinalFormField } from 'react-final-form';

import { FormField, FormText, Switch } from 'waldur-ui';

import { composeValidators } from '@/core/validators';
import { NumberField } from '@/form';
import { translate } from '@/i18n';
import { Limits } from '@/marketplace/common/types';
import {
  formatIntField,
  getLimitParser,
  getLimitStep,
} from '@/marketplace/common/utils';
import { getResourceComponentValidator } from '@/marketplace/offerings/store/limits';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import { PriceField } from '@/marketplace/resources/change-limits/PriceField';
import { PriceTooltip } from '@/price/PriceTooltip';
import type { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';

import { ComponentRowType, PeriodTotalRow } from './utils';

/** A component's limits, or one of the price totals under them. */
export type LimitTableRow =
  | { uuid: string; component: ComponentRowType; total?: never }
  | { uuid: string; total: PeriodTotalRow; component?: never };

interface LimitColumnsOptions {
  shouldConcealPrices: boolean;
  limits: Record<string, Limits>;
  /** For nested fields */
  parentName?: string;
  /** Calculated from order options: shown, not edited. */
  derivedTypes: { has: (type: string) => boolean };
  /** Whose limit the user may raise but not lower. */
  increaseOnlyTypes?: { has: (type: string) => boolean };
  /** Shown without an input, as part of a preview. */
  readOnly?: boolean;
}

const LimitInput: FC<any> = (props) => (
  <FormField onClick={(e) => e.stopPropagation()}>
    {props.offeringComponent.is_boolean ? (
      <Switch
        label=""
        checked={parseInt(props.input.value) === 1}
        onCheckedChange={(value) => props.input.onChange(value ? 1 : 0)}
      />
    ) : (
      <NumberField
        input={props.input}
        meta={props.meta}
        unit={props.offeringComponent.measured_unit}
        min={props.limits.min}
        max={props.limits.max}
        step={getLimitStep(props.offeringComponent)}
      />
    )}
  </FormField>
);

export const getLimitColumns = ({
  shouldConcealPrices,
  limits,
  parentName,
  derivedTypes,
  increaseOnlyTypes,
  readOnly,
}: LimitColumnsOptions): Column<LimitTableRow>[] => [
  {
    title: translate('Component'),
    className: 'whitespace-nowrap',
    render: ({ row }) =>
      row.total ? (
        <span className="font-semibold text-primary">{row.total.label}</span>
      ) : (
        <>{row.component.name}</>
      ),
  },
  {
    title: translate('Usage'),
    render: ({ row }) =>
      row.component ? <>{renderFieldOrDash(row.component.usage)}</> : null,
  },
  {
    title: translate('Current limit'),
    render: ({ row }) =>
      row.component ? <>{renderFieldOrDash(row.component.limit)}</> : null,
  },
  {
    title: translate('New limit'),
    render: ({ row }) => {
      const component = row.component;
      if (!component) {
        return null;
      }
      const derived = derivedTypes.has(component.type);
      return derived || readOnly ? (
        <>
          {renderFieldOrDash(component.newLimit)} {component.measured_unit}
          {derived ? (
            <FormText as="div" variant="muted">
              {translate('Calculated from the order options')}
            </FormText>
          ) : null}
        </>
      ) : (
        <>
          <FinalFormField
            name={`${parentName ? parentName + '.' : ''}limits.${component.type}`}
            parse={getLimitParser(component)}
            format={formatIntField}
            validate={composeValidators(
              ...getResourceComponentValidator(limits[component.type]),
            )}
            min={0}
            component={LimitInput}
            offeringComponent={component}
            limits={limits[component.type]}
          />
          {increaseOnlyTypes?.has(component.type) ? (
            <FormText as="div" variant="muted">
              {translate('Can only be increased')}
            </FormText>
          ) : null}
        </>
      );
    },
  },
  {
    title: translate('Difference'),
    render: ({ row }) =>
      row.component ? (
        <ChangedLimitField
          changedLimit={row.component.changedLimit}
          unit={row.component.measured_unit}
        />
      ) : null,
  },
  ...(shouldConcealPrices
    ? []
    : [
        {
          title: (
            <>
              {translate('Price')}
              <PriceTooltip />
            </>
          ),
          render: ({ row }) =>
            row.total ? (
              <span className="font-medium text-primary">
                <PriceField
                  price={row.total.total}
                  changedPrice={row.total.changedTotal}
                  suffix={row.total.priceSuffix}
                />
              </span>
            ) : (
              <PriceField
                price={row.component.price}
                changedPrice={row.component.changedPrice}
                suffix={row.component.priceSuffix}
              />
            ),
        } as Column<LimitTableRow>,
      ]),
];
