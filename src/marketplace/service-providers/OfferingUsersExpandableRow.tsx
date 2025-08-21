import { OfferingUser } from 'waldur-js-client';

import { TruncatedDescription } from '@waldur/core/TruncatedDescription';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const OfferingUsersExpandableRow = ({ row }: { row: OfferingUser }) => {
  return (
    <ExpandableContainer asTable>
      <Field
        label={translate('Comment')}
        value={
          row.service_provider_comment ? (
            <TruncatedDescription
              text={row.service_provider_comment}
              max={550}
            />
          ) : (
            'N/A'
          )
        }
        className="align-baseline"
      />

      <Field
        label={translate('Comment URL')}
        value={row.service_provider_comment_url || 'N/A'}
      />
    </ExpandableContainer>
  );
};
