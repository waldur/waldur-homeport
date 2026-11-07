import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';

interface OwnProps {
  plansUsage: PlanUsageResponse[];
  className?: string;
  id?: string;
}

const PlanGroup = ({ plan }: { plan: PlanUsageResponse }) => (
  <div>
    <h4 className="font-medium mb-3">{plan.plan_name}:</h4>
    <Table scrollable={false} className="text-tertiary mb-8">
      <TableBody>
        <TableRow divided={false}>
          <TableHead className="text-secondary font-medium pe-5">
            {translate('Active count')}:
          </TableHead>
          <TableCell>{plan.usage}</TableCell>
        </TableRow>
        <TableRow divided={false}>
          <TableHead className="text-secondary font-medium pe-5">
            {translate('Limit')}:
          </TableHead>
          <TableCell>{renderFieldOrDash(plan.limit)}</TableCell>
        </TableRow>
        <TableRow divided={false}>
          <TableHead className="text-secondary font-medium pe-5">
            {translate('Remaining')}:
          </TableHead>
          <TableCell>
            {plan.remaining === null ? DASH_ESCAPE_CODE : plan.remaining}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
);

export const PlanUsageList: FC<OwnProps> = (props) => {
  return (
    <Card bordered className={props.className} id={props.id}>
      <CardHeader>
        <CardTitle as="div">{translate('Plans')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!props.plansUsage?.length && (
          <div className="text-quaternary">
            {translate('There are no plans')}
          </div>
        )}
        {props.plansUsage &&
          props.plansUsage.map((plan) => (
            <PlanGroup key={plan.plan_uuid} plan={plan} />
          ))}
      </CardContent>
    </Card>
  );
};
