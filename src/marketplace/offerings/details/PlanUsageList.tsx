import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

interface OwnProps {
  plansUsage: PlanUsageResponse[];
  className?: string;
  id?: string;
}

export const PlanUsageList: FC<OwnProps> = (props) => (
  <Card bordered className={props.className} id={props.id}>
    <CardHeader>
      <CardTitle as="div">
        <h3>{translate('Plans')}</h3>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {!props.plansUsage?.length ? (
        <div className="text-quaternary">{translate('There are no plans')}</div>
      ) : (
        <div className="flex flex-col gap-6">
          {props.plansUsage.map((plan) => (
            <div key={plan.plan_uuid}>
              <h4 className="font-medium mb-3">{plan.plan_name}</h4>
              <PropertyList variant="summary" hideIfEmpty={false}>
                <PropertyItem
                  label={translate('Active count')}
                  value={propVal.count(plan.usage)}
                />
                <PropertyItem
                  label={translate('Limit')}
                  value={propVal.number(plan.limit)}
                />
                <PropertyItem
                  label={translate('Remaining')}
                  value={propVal.number(plan.remaining)}
                />
              </PropertyList>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
