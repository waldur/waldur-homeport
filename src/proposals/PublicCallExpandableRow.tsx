import Markdown from 'markdown-to-jsx';
import { FunctionComponent, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { Field } from '@waldur/resource/summary';
import { getCustomer } from '@waldur/workspace/selectors';

import { Call } from './types';
import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
  getRoundsWithStatus,
} from './utils';

export const PublicCallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const customer = useSelector(getCustomer);

  const activeRound = useMemo(() => {
    const items = getRoundsWithStatus(row.rounds);
    const first = items[0];
    if (
      first &&
      (first.status.value === 'open' || first.status.value === 'scheduled')
    ) {
      return first;
    }
    return null;
  }, [row]);

  return (
    <Row>
      <Col sm={12} md="auto" className="mb-4">
        <div className="symbol symbol-50px">
          {customer?.image ? (
            <Image src={customer.image} size={50} />
          ) : (
            <ImagePlaceholder width="50px" height="50px">
              <div className="symbol-label fs-6 fw-bold">
                {getItemAbbreviation(customer)}
              </div>
            </ImagePlaceholder>
          )}
        </div>
      </Col>
      <Col>
        <Row>
          <Col xs={12} className="text-dark mb-2">
            {row.description ? (
              <Markdown>{row.description}</Markdown>
            ) : (
              <p className="text-muted fst-italic fs-7">
                {translate('No description')}
              </p>
            )}
          </Col>

          {activeRound ? (
            <>
              <Col lg={12} xl={6}>
                <Field
                  label={translate('Next cutoff')}
                  value={formatDateTime(activeRound.cutoff_time)}
                  isStuck
                />
                <Field
                  label={translate('Review strategy')}
                  value={formatRoundReviewStrategy(activeRound.review_strategy)}
                  isStuck
                />
              </Col>
              <Col lg={12} xl={6}>
                <Field
                  label={translate('Round strategy')}
                  value={formatRoundAllocationStrategy(
                    activeRound.deciding_entity,
                  )}
                  isStuck
                />
                <Field
                  label={translate('Allocation strategy')}
                  value={formatRoundAllocationTime(activeRound.allocation_time)}
                  isStuck
                />
              </Col>
            </>
          ) : (
            <Col xs={12}>
              <p className="text-muted fst-italic fs-7">
                {translate('No active round')}
              </p>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
};
