import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Rule } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface RuleExpandableRowProps {
  row: Rule;
}

export const RuleExpandableRow: FC<RuleExpandableRowProps> = ({ row }) => (
  <ExpandableContainer>
    <Row className="g-4">
      {Boolean(row.plan) && (
        <Col md={5} xxl={4}>
          <h6 className="text-gray-700 mb-3">
            {translate('Resource template')}
          </h6>
          <Field
            label={translate('Category')}
            value={row.category_title}
            space={2}
          />
          <Field
            label={translate('Offering')}
            value={row.offering_name}
            space={2}
          />
          <Field label={translate('Plan')} value={row.plan_name} space={2} />
        </Col>
      )}
      <Col xs={6}>
        <h6 className="text-gray-700 mb-3">{translate('Attributes')}</h6>
        <Field
          label={translate('Email patterns')}
          value={
            row.user_email_patterns?.length
              ? row.user_email_patterns.join(', ')
              : DASH_ESCAPE_CODE
          }
          valueClass="ellipsis"
          space={2}
        />
        <Field
          label={translate('Affiliations')}
          value={
            row.user_affiliations?.length
              ? row.user_affiliations.join(', ')
              : DASH_ESCAPE_CODE
          }
          valueClass="ellipsis"
          space={2}
        />
      </Col>
    </Row>
  </ExpandableContainer>
);
