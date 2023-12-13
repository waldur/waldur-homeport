import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProposalCall } from './types';

export const PublicCallExpandableRow: FunctionComponent<{
  row: ProposalCall;
}> = ({ row }) => {
  const customer = useSelector(getCustomer);

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
          {row.description && (
            <Col xs={12} className="text-dark mb-2">
              {row.description}
            </Col>
          )}
          <Col lg={12} xl={6}>
            <Field
              label={translate('Next cutoff')}
              value={renderFieldOrDash(formatDateTime(row.end_time))}
              isStuck
            />
            <Field
              label={translate('Review strategy')}
              value={row.review_strategy}
              isStuck
            />
          </Col>
          <Col lg={12} xl={6}>
            <Field
              label={translate('Round strategy')}
              value={row.round_strategy}
              isStuck
            />
            <Field
              label={translate('Allocation strategy')}
              value={row.allocation_strategy}
              isStuck
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
