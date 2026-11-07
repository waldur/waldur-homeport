import { FunctionComponent } from 'react';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { continuouslyOpenLabel } from './roundCutoff';
import { Call } from './types';
import { getActiveRound } from './utils';

/** Key/value rows, as other expandable rows show their details. */
export const PublicCallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const activeRound = getActiveRound(row);

  return (
    <ExpandableContainer asTable>
      <PropertyItem
        label={translate('Description')}
        value={propVal.richText(row.description, { format: 'markdown' })}
        hideIfEmpty={false}
      />
      <PropertyItem
        label={translate('Next cutoff')}
        value={
          !activeRound
            ? null
            : activeRound.cutoff_time
              ? propVal.date(activeRound.cutoff_time, {
                  precision: 'datetime',
                })
              : continuouslyOpenLabel()
        }
        hideIfEmpty={false}
      />
    </ExpandableContainer>
  );
};
