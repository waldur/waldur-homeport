import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { translate } from '@waldur/i18n';
import { QuotaCell } from '@waldur/marketplace/resources/details/QuotaCell';

import { Call } from '../types';

interface ProposalCallQuotasProps {
  call: Call;
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

export const ProposalCallQuotas: FC<ProposalCallQuotasProps> = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 320 });
  const dummyQuotas = useMemo(
    () => [
      { title: translate('Max applicants'), usage: 64, units: 'submissions' },
      {
        title: translate('Reviewed'),
        usage: 0,
        limit: 128,
        units: 'applicants',
      },
      {
        title: translate('Resource availability'),
        usage: 48.55,
        limit: 100,
        units: '%',
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
