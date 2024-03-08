import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { Component, PlanPeriod } from './types';

const EstimateUsageComponentDialog = lazyComponent(
  () => import('./EstimateUsageComponentDialog'),
  'EstimateUsageComponentDialog',
);

interface UsageComponentRowProps {
  offeringComponent: Component;
  period?: PlanPeriod;
  hidePrices?: boolean;
}

export const UsageComponentRow: React.FC<UsageComponentRowProps> = (props) => {
  const dispatch = useDispatch();
  const onClick = useCallback(
    () =>
      dispatch(
        openModalDialog(EstimateUsageComponentDialog, {
          size: 'lg',
          resolve: {
            component: props.offeringComponent,
            period: props.period,
            hidePrices: props.hidePrices,
          },
        }),
      ),
    [dispatch, props],
  );

  return (
    <tr>
      <th>
        {props.offeringComponent.name}
        <Tip
          label={props.offeringComponent.type}
          id={`componentTypeTooltip-${props.offeringComponent.type}`}
          className="mx-1"
        >
          {' '}
          <i className="fa fa-question-circle" />
        </Tip>
        <span className="fw-normal fst-italic">
          (
          {props.offeringComponent.measured_unit
            ? translate('{price} per {unit}', {
                price: defaultCurrency(props.offeringComponent.price),
                unit: props.offeringComponent.measured_unit,
              })
            : defaultCurrency(props.offeringComponent.price)}
          )
        </span>
      </th>
      <td></td>
      <td>{translate('Usage based')}</td>
      {!props.hidePrices ? (
        <>
          <td className="text-center" width="20px">
            =
          </td>
          <td className="estimate">
            <button
              type="button"
              className="text-link fst-italic"
              onClick={onClick}
            >
              {translate('Estimate')}
            </button>
          </td>
        </>
      ) : null}
    </tr>
  );
};
