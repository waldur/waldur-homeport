import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PropertyItem,
  PropertyList,
  PropertyListSection,
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
        <PropertyList className="flex flex-col gap-6">
          {props.plansUsage.map((plan) => (
            <PropertyListSection key={plan.plan_uuid} title={plan.plan_name}>
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
            </PropertyListSection>
          ))}
        </PropertyList>
      )}
    </CardContent>
  </Card>
);
