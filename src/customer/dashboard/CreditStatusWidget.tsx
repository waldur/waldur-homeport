import { Circle } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Stack } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { RingChart } from '@waldur/dashboard/RingChart';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Customer } from '@waldur/workspace/types';

interface CreditStatusWidgetProps {
  customer: Customer;
}

export const CreditStatusWidget: FC<CreditStatusWidgetProps> = (props) => {
  const credit = props.customer.credit;
  return (
    <WidgetCard
      cardTitle={translate('Credits')}
      title={defaultCurrency(credit?.value)}
      className="h-100"
      meta={
        <>
          <div>
            {translate(
              '{amount} spent last month',
              {
                amount: (
                  <ChangesAmountBadge
                    changes={credit.consumption_last_month}
                    showOnInfinity
                    showOnZero
                    asBadge={false}
                    unit={' ' + ENV.plugins.WALDUR_CORE.CURRENCY_NAME}
                  />
                ),
              },
              formatJsxTemplate,
            )}
          </div>
          <div>
            {translate('End date')}:{' '}
            {credit.end_date ? formatDate(credit.end_date) : DASH_ESCAPE_CODE}
          </div>
        </>
      }
      left={
        <RingChart
          option={{
            title: translate('Allocated\nto projects'),
            label: defaultCurrency(credit?.allocated_to_projects),
            value: credit?.allocated_to_projects,
            max: Number(credit?.value),
          }}
          className="me-8"
        />
      }
      right={
        <Col xs="auto" className="text-gray-700 mb-2">
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <Circle size={10} weight="fill" className="text-primary-100" />
            {translate('Total')}
          </Stack>
          <Stack direction="horizontal" gap={2} className="align-items-center">
            <Circle size={10} weight="fill" className="text-primary" />
            {translate('Allocated')}
          </Stack>
        </Col>
      }
    />
  );
};
