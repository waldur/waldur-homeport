import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { CallOffering } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';

interface OwnProps {
  row: CallOffering;
}

export const OfferingRequestsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    {typeof row.attributes?.limits === 'object' && (
      <>
        <h3>{translate('Components')}</h3>
        {Object.entries(row.attributes.limits).map(
          ([key, value]: [string, string]) => (
            <Field key={key} label={key} value={value} isStuck />
          ),
        )}
      </>
    )}
    <br />
    <hr />
    <Field
      label={translate('Contact')}
      value={`${row.created_by_name} / ${row.created_by_email}`}
      isStuck
    />
    <Field label={translate('Message')} value={row.description} isStuck />
  </div>
);
