import { FunctionComponent } from 'react';
import { ProviderRequestedOffering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface OwnProps {
  row: ProviderRequestedOffering;
}

export const OfferingRequestsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => (
  <ExpandableContainer>
    {typeof row.attributes['limits'] === 'object' && (
      <>
        <h3>{translate('Components')}</h3>
        {Object.entries(row.attributes['limits']).map(
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
  </ExpandableContainer>
);
