import { FunctionComponent } from 'react';
import { Issue } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { FormattedHtml } from '@/core/FormattedHtml';
import { FormattedJira } from '@/core/FormattedJira';
import { translate } from '@/i18n';
import { linkify, withLineBreaks } from '@/issues/utils';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const IssuesListExpandableRow: FunctionComponent<{
  row: Issue;
  supportOrStaff: boolean;
}> = ({ row, supportOrStaff }) => (
  <ExpandableContainer>
    {/* Two columns of facts about the issue, each row keeping its place even
        when the issue has no value for it. */}
    <div className="flex flex-wrap gap-x-16 gap-y-3">
      <PropertyList variant="summary" termWidth="100px" hideIfEmpty={false}>
        <PropertyItem label={translate('Reporter')} value={row.reporter_name} />
        <PropertyItem
          label={translate('Organization')}
          value={row.customer_name}
        />
        <PropertyItem label={translate('Project')} value={row.project_name} />
      </PropertyList>
      <PropertyList variant="summary" termWidth="100px" hideIfEmpty={false}>
        <PropertyItem
          label={translate('Service type')}
          value={row.resource_type}
        />
        <PropertyItem
          label={translate('Created')}
          value={propVal.date(row.created)}
        />
        {supportOrStaff && (
          <PropertyItem
            label={translate('Assigned to')}
            value={row.assignee_name}
          />
        )}
        <PropertyItem label={translate('Type')} value={row.type} />
      </PropertyList>
    </div>
    {row.description && (
      <div className="mt-3">
        {/* The backend decides the markup the description arrives in. */}
        <div className="text-secondary font-medium mb-1">
          {translate('Description')}:
        </div>
        <div className="wrap-anywhere">
          {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE === 'atlassian' ? (
            <FormattedJira text={linkify(row.description)} />
          ) : (
            <FormattedHtml html={linkify(withLineBreaks(row.description))} />
          )}
        </div>
      </div>
    )}
  </ExpandableContainer>
);
