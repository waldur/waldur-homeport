import React from 'react';

import { translate } from '@waldur/i18n';
import { useOfferingCategories } from '@waldur/navigation/sidebar/ResourcesMenu';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { Project } from '@waldur/workspace/types';

import { combineProjectCounterRows, parseProjectCounters } from './utils';

export const ProjectExpandableRowContainer: React.FC<{
  row: Project;
}> = ({ row }) => {
  const categories = useOfferingCategories();
  const counterRows = parseProjectCounters(
    categories || [],
    row.marketplace_resource_count,
  );
  const counters = combineProjectCounterRows(counterRows);

  return (
    <ExpandableContainer asTable>
      {counters.length === 0
        ? translate('There are no resources')
        : counters.map((item, index) => (
            <Field key={index} label={item.label} value={item.value} />
          ))}
      <Field label={translate('Backend ID')} value={row.backend_id} />
    </ExpandableContainer>
  );
};
