import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

const InfoSummary: FunctionComponent<{ infoObj }> = ({ infoObj }) => {
  const entries = Object.entries(infoObj);
  if (!entries.length) return <span>{DASH_ESCAPE_CODE}</span>;
  return (
    <Container className="border-2 border-start border-gray-500 ps-4">
      {entries.map(([key, value]) => (
        <Field key={key} label={key} value={value} />
      ))}
    </Container>
  );
};

export const OrderItemExpandableRow: FunctionComponent<{ row }> = ({ row }) => (
  <Container>
    <Field label={translate('Created by')} value={row.created_by_full_name} />
    <Field
      label={translate('Limits')}
      value={<InfoSummary infoObj={row.limits} />}
    />
    <Field
      label={translate('Attributes')}
      value={<InfoSummary infoObj={row.attributes} />}
    />
    <Field label={translate('Plan')} value={renderFieldOrDash(row.plan_name)} />
    <Field
      label={translate('Plan unit')}
      value={renderFieldOrDash(row.plan_unit)}
    />
    <Field
      label={translate('New plan')}
      value={renderFieldOrDash(row.new_plan_name)}
    />
    <Field
      label={translate('Created at')}
      value={formatDateTime(row.created)}
    />
  </Container>
);
