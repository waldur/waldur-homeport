import React from 'react';
import { Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import { BasePublicPlan } from 'waldur-js-client';

import { GRID_BREAKPOINTS } from '@/core/constants';
import { translate } from '@/i18n';
import { OfferingLimits } from '@/marketplace/offerings/store/types';
import { PriceTooltip } from '@/price/PriceTooltip';

import { ComponentRow } from './ComponentRow';
import { ComponentTotalRow } from './ComponentTotalRow';
import { StateProps } from './connector';

interface ChangeLimitsComponentProps extends StateProps {
  plan: BasePublicPlan;
  offeringLimits: OfferingLimits;
  /** For nested fields */
  parentName?: string;
  finalForm?: boolean;
}

export const ChangeLimitsComponent: React.FC<ChangeLimitsComponentProps> = (
  props,
) => {
  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });

  const periodsCountToShow = isMd ? 1 : 3;

  return (
    <div>
      {props.plan ? (
        <p>
          <strong>{translate('Current plan')}</strong>: {props.plan.name}
        </p>
      ) : (
        <p>{translate('Resource does not have any plan.')}</p>
      )}
      <Card className="card-table card-bordered full-width">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <div className="table-container">
              <table className="table table-row-bordered table-expandable align-middle">
                <thead>
                  <tr className="align-middle">
                    <th>{translate('Component')}</th>
                    <th>{translate('Usage')}</th>
                    <th>{translate('Current limit')}</th>
                    <th>{translate('New limit')}</th>
                    <th>{translate('Difference')}</th>
                    {props.shouldConcealPrices
                      ? null
                      : props.periods
                          .slice(0, periodsCountToShow)
                          .map((period, index) => (
                            <th className="col-sm-1" key={index}>
                              {period}
                              <PriceTooltip />
                            </th>
                          ))}
                  </tr>
                </thead>
                <tbody>
                  {props.components.map((component, index) => (
                    <ComponentRow
                      key={index}
                      component={component}
                      limits={props.offeringLimits[component.type]}
                      shouldConcealPrices={props.shouldConcealPrices}
                      periodsCountToShow={periodsCountToShow}
                      periods={props.periods}
                      parentName={props.parentName}
                      finalForm={props.finalForm}
                    />
                  ))}
                </tbody>
                <tfoot>
                  {props.shouldConcealPrices ? null : (
                    <ComponentTotalRow
                      totalPeriods={props.totalPeriods}
                      changedTotalPeriods={props.changedTotalPeriods}
                      periodsCountToShow={periodsCountToShow}
                      periods={props.periods}
                    />
                  )}
                </tfoot>
              </table>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
