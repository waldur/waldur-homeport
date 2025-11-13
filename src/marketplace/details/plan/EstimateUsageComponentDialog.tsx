import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { MeasuredUnitInput } from './MeasuredUnitInput';
import { Component, PlanPeriod } from './types';

interface OwnProps {
  resolve: {
    component: Component;
    period?: PlanPeriod;
    hidePrices?: boolean;
  };
}

export const EstimateUsageComponentDialog: FC<OwnProps> = (props) => {
  const [qty, setQty] = useState(props.resolve.component.amount);

  const perPeriod = !props.resolve.period
    ? ''
    : props.resolve.period === 'annual'
      ? ' /year'
      : ' /mo';

  return (
    <ModalDialog
      title={translate('Estimate usage of {component}', {
        component: props.resolve.component.name,
      })}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <table className="w-100">
        <tbody>
          <tr>
            <th>
              {props.resolve.component.name}
              <Tip
                label={props.resolve.component.type}
                id={`componentTypeTooltip-${props.resolve.component.type}`}
                className="mx-1"
              >
                {' '}
                <QuestionIcon weight="bold" />
              </Tip>
              <span className="fw-normal fst-italic">
                (
                {props.resolve.component.measured_unit
                  ? translate('{price} per {unit}', {
                      price: defaultCurrency(props.resolve.component.price),
                      unit: props.resolve.component.measured_unit,
                    })
                  : defaultCurrency(props.resolve.component.price)}
                )
              </span>
            </th>
            <td>X</td>
            <td className="control">
              <MeasuredUnitInput
                component={props.resolve.component}
                input={{ value: qty, onChange: setQty }}
              />
            </td>
            <td className="text-center" width="20px">
              =
            </td>
            {!props.resolve.hidePrices ? (
              <td className="estimate">
                {defaultCurrency(qty * props.resolve.component.price)}
                {perPeriod}
              </td>
            ) : null}
          </tr>
        </tbody>
      </table>
    </ModalDialog>
  );
};
