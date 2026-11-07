import { FC, useState } from 'react';

import {
  HelpIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'waldur-ui';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
      <Table scrollable={false} className="w-full">
        <TableBody>
          <TableRow divided={false}>
            <TableHead>
              {props.resolve.component.name}
              <HelpIcon label={props.resolve.component.type} className="mx-1" />
              <span className="font-normal italic">
                (
                {props.resolve.component.measured_unit
                  ? translate('{price} per {unit}', {
                      price: defaultCurrency(props.resolve.component.price),
                      unit: props.resolve.component.measured_unit,
                    })
                  : defaultCurrency(props.resolve.component.price)}
                )
              </span>
            </TableHead>
            <TableCell>X</TableCell>
            <TableCell>
              <MeasuredUnitInput
                component={props.resolve.component}
                input={{ value: qty, onChange: setQty }}
              />
            </TableCell>
            <TableCell className="text-center" width="20px">
              =
            </TableCell>
            {!props.resolve.hidePrices ? (
              <TableCell>
                {defaultCurrency(qty * props.resolve.component.price)}
                {perPeriod}
              </TableCell>
            ) : null}
          </TableRow>
        </TableBody>
      </Table>
    </ModalDialog>
  );
};
