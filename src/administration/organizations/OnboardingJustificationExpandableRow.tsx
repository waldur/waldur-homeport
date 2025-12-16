import { FC } from 'react';
import { OnboardingJustification } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { decodeFileName } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

export const OnboardingJustificationExpandableRow: FC<{
  row: OnboardingJustification;
}> = ({ row }) => {
  const docs = row.supporting_documentation;

  return (
    <ExpandableContainer>
      <Field
        label={translate('User name')}
        value={row.user_full_name}
        isStuck
        labelClass="me-2"
      />
      <Field
        label={translate('Submitted')}
        value={formatDateTime(row.created)}
        isStuck
        labelClass="me-2"
      />
      <Field
        label={translate('Country')}
        value={row.country || translate('N/A')}
        isStuck
        labelClass="me-2"
      />
      {docs && docs.length > 0 && (
        <Field
          label={translate('Supporting documentation')}
          value={docs.map((doc, index) => (
            <ExternalLink
              key={index}
              url={doc.file}
              label={decodeFileName(doc.file_name) + ', '}
              iconless
            />
          ))}
          isStuck
          labelClass="me-2"
        />
      )}
    </ExpandableContainer>
  );
};
