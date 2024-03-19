import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { QuotaCell } from '@waldur/marketplace/resources/details/QuotaCell';

import { Round } from '../types';

interface RoundQuotasProps {
  round: Round;
}

const QuotaItem = (props: { title; usage; limit?; units; isSmallScreen }) => {
  return (
    <Col xs={props.isSmallScreen ? 12 : 6} sm={6} md={12} xl={6}>
      <QuotaCell
        usage={props.usage}
        limit={props.limit}
        title={props.title}
        units={props.units}
      />
    </Col>
  );
};

export const RoundQuotas: FC<RoundQuotasProps> = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });
  const dummyQuotas = useMemo(
    () => [
      { title: translate('Submissions'), usage: 64 },
      {
        title: translate('Reviewed'),
        usage: 0,
        limit: 128,
        units: 'applicants',
      },
      {
        title: translate('Allocated offerings'),
        usage: 140000,
        limit: 1848424,
        units: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
      },
    ],
    [],
  );
  return (
    <Row>
      {dummyQuotas.map((quota, i) => (
        <QuotaItem
          key={i}
          title={quota.title}
          usage={quota.usage}
          limit={quota.limit}
          units={quota.units}
          isSmallScreen={isSmallScreen}
        />
      ))}
    </Row>
  );
};
