import { FC } from 'react';
import { Card, ProgressBar, Stack } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';
import { RingChart } from './RingChart';

interface OwnProps {
  className?: string;
}

const dummyChartItems = [
  {
    uuid: 1,
    title: 'Commited cores',
    value: 600,
    max: 3534,
  },
  {
    uuid: 2,
    title: 'Commited memory',
    value: 10430,
    max: 12324,
  },
  {
    uuid: 3,
    title: 'Commited networks',
    value: 20,
    max: 256,
  },
];

export const OfferingKeyFiguresSection: FC<OwnProps> = (props) => {
  return (
    <Card className={props.className}>
      <Card.Body>
        <PublicOfferingCardTitle>
          {translate('Key figures')}
        </PublicOfferingCardTitle>
        <div className="mb-15">
          <Stack direction="horizontal" gap={2}>
            <div>
              <h5 className="text-primary">{defaultCurrency(95000)}</h5>
              <label className="text-gray-700">
                {translate('Current revenue')}:
              </label>
            </div>
            <div className="ms-auto text-end">
              <h5>{defaultCurrency(184000)}</h5>
              <label className="text-gray-700">
                {translate('Est revenue')}:
              </label>
            </div>
          </Stack>
          <ProgressBar
            variant="primary"
            now={60}
            className="h-6px bg-dark mt-2"
          />
        </div>
        <Stack
          direction="horizontal"
          gap={2}
          className="ring-charts justify-content-between mb-15"
        >
          {dummyChartItems.map((item) => (
            <RingChart
              key={item.uuid}
              option={{
                title: item.title,
                label: `${item.value}/${item.max}`,
                value: item.value,
                max: item.max,
              }}
            />
          ))}
        </Stack>
        <Stack direction="horizontal" gap={2} className="mb-10">
          <div>
            <h1 className="display-2">4</h1>
            <h5 className="text-decoration-underline">
              {translate('Support tickets')}
            </h5>
          </div>
          <div className="ms-auto">
            <h1 className="display-2">0</h1>
            <h5 className="text-decoration-underline">
              {translate('Status messages')}
            </h5>
          </div>
        </Stack>
      </Card.Body>
    </Card>
  );
};
