import { FC, useState } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

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
                <i className="fa fa-question-circle" />
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
              <InputGroup>
                <FormControl
                  type="number"
                  min={props.resolve.component.min_value || 0}
                  max={props.resolve.component.max_value}
                  onChange={(e: any) => setQty(e.target.value)}
                  aria-describedby={`basic-addon-${props.resolve.component.type}`}
                />
                {props.resolve.component.measured_unit && (
                  <InputGroup.Text
                    className="text-muted"
                    id={`basic-addon-${props.resolve.component.type}`}
                  >
                    {props.resolve.component.measured_unit}
                  </InputGroup.Text>
                )}
              </InputGroup>
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
