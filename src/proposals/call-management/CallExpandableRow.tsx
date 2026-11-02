import { FunctionComponent, useMemo } from 'react';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { Call } from '@/proposals/types';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { getRoundsWithStatus } from '../utils';

export const CallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const activeRound = useMemo(() => {
    const first = getRoundsWithStatus(row.rounds)[0];
    if (
      first &&
      (first.status.label === 'Open' || first.status.label === 'Scheduled')
    ) {
      return first;
    }
    return null;
  }, [row]);

  return (
    <ExpandableContainer asTable>
      <PropertyItem
        label={translate('Next cutoff')}
        value={propVal.date(activeRound?.cutoff_time, {
          precision: 'datetime',
        })}
        hideIfEmpty={false}
      />

      <PropertyItem label={translate('Submissions')} value="0" />
      <PropertyItem label={translate('Pending review')} value="0" />
      <PropertyItem
        label={translate('Resource availability')}
        value="44.54/100 % (i)"
        className="whitespace-nowrap"
      />
    </ExpandableContainer>
  );
};
