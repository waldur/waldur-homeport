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
import { renderFieldOrDash } from '@waldur/table/utils';

export const IssuesListExpandableRow: FunctionComponent<{
  row;
  supportOrStaff;
}> = ({ row, supportOrStaff }) => (
  <ExpandableContainer>
    <Row>
      <Col xs={6}>
        <Field label={translate('Reporter')}>
          {renderFieldOrDash(row.reporter_name)}
        </Field>
        <Field label={translate('Organization')}>
          {renderFieldOrDash(row.customer_name)}
        </Field>
        <Field label={translate('Project')}>
          {renderFieldOrDash(row.project_name)}
        </Field>
      </Col>
      <Col xs={6}>
        <Field label={translate('Service type')}>
          {renderFieldOrDash(row.project_name)}
        </Field>
        <Field label={translate('Created')}>
          {renderFieldOrDash(row.resource_type)}
        </Field>
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
