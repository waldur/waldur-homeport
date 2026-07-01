import { FunctionComponent, ReactNode } from 'react';

import { ENV } from '@/core/config';
import { formatDate } from '@/core/dateUtils';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { translate } from '@/i18n';
import { linkify } from '@/issues/utils';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import { renderFieldOrDash } from '@/table/utils';

const FieldGrid: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      columnGap: 12,
      rowGap: 4,
      alignContent: 'start',
    }}
  >
    {children}
  </div>
);

const GridField: FunctionComponent<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <>
    <div className="text-gray-700 fw-bold">{label}:</div>
    <div className="text-gray-500">{children}</div>
  </>
);

export const IssuesListExpandableRow: FunctionComponent<{
  row;
  supportOrStaff;
}> = ({ row, supportOrStaff }) => (
  <ExpandableContainer
    style={{
      width: 'auto',
      maxWidth: '100%',
      marginLeft: 48,
      position: 'static',
      left: 'auto',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 64,
        rowGap: 12,
      }}
    >
      <FieldGrid>
        <GridField label={translate('Reporter')}>
          {renderFieldOrDash(row.reporter_name)}
        </GridField>
        <GridField label={translate('Organization')}>
          {renderFieldOrDash(row.customer_name)}
        </GridField>
        <GridField label={translate('Project')}>
          {renderFieldOrDash(row.project_name)}
        </GridField>
      </FieldGrid>
      <FieldGrid>
        <GridField label={translate('Service type')}>
          {renderFieldOrDash(row.resource_type)}
        </GridField>
        <GridField label={translate('Created')}>
          {formatDate(row.created)}
        </GridField>
        {supportOrStaff && (
          <GridField label={translate('Assigned to')}>
            {renderFieldOrDash(row.assignee_name)}
          </GridField>
        )}
        <GridField label={translate('Type')}>
          {renderFieldOrDash(row.type)}
        </GridField>
      </FieldGrid>
    </div>
    <div style={{ marginTop: 4 }}>
      <Field
        label={translate('Description')}
        labelCol={12}
        valueCol={12}
        space={0}
      >
        <div style={{ overflowWrap: 'anywhere' }}>
          {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
            <FormattedJira text={linkify(row.description)} />
          ) : (
            <FormattedHtml html={linkify(row.description)} />
          )}
        </div>
      </Field>
    </div>
  </ExpandableContainer>
);
