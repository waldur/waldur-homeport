import { FC } from 'react';
import { OnboardingJustification } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { decodeFileName } from '@/core/utils';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const OnboardingJustificationExpandableRow: FC<{
  row: OnboardingJustification;
}> = ({ row }) => {
  const docs = row.supporting_documentation;

  return (
    <ExpandableContainer asTable>
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('User name')}
          value={row.user_full_name}
        />
        <PropertyItem
          label={translate('Submitted')}
          value={propVal.date(row.created, { precision: 'datetime' })}
        />
        <PropertyItem
          label={translate('Country')}
          value={row.country}
          hideIfEmpty={false}
        />
        <PropertyItem
          label={translate('Supporting documentation')}
          value={
            docs?.length
              ? docs.map((doc, index) => (
                  <ExternalLink
                    key={index}
                    url={doc.file}
                    label={decodeFileName(doc.file_name) + ', '}
                    iconless
                  />
                ))
              : null
          }
        />
      </PropertyList>
    </ExpandableContainer>
  );
};
