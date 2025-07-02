import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { ENV } from '@waldur/core/config';
import { formatDate } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { translate } from '@waldur/i18n';
import { linkify } from '@waldur/issues/utils';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const IssuesListExpandableRow: FunctionComponent<{
  row;
  supportOrStaff;
}> = ({ row, supportOrStaff }) => (
  <ExpandableContainer>
    <Row className="mb-2">
      <Col xs={6}>
        <Field label={translate('Reporter')}>
          {row.reporter_name || 'N/A'}
        </Field>
        <Field label={translate('Organization')}>
          {row.customer_name || 'N/A'}
        </Field>
        <Field label={translate('Project')}>{row.project_name || 'N/A'}</Field>
      </Col>
      <Col xs={6}>
        <Field label={translate('Service type')}>
          {row.project_name || 'N/A'}
        </Field>
        <Field label={translate('Created')}>{row.resource_type || 'N/A'}</Field>
        {supportOrStaff && (
          <Field label={translate('Assigned to')}>
            {formatDate(row.created)}
          </Field>
        )}
      </Col>
    </Row>
    <Field label={translate('Description')} labelCol={12} valueCol={12}>
      <span className="d-inline-block">
        {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
          <FormattedJira text={linkify(row.description)} />
        ) : (
          <FormattedHtml html={linkify(row.description)} />
        )}
      </span>
    </Field>
  </ExpandableContainer>
);
