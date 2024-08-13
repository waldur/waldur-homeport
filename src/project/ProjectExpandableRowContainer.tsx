import React from 'react';
import { Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useOfferingCategories } from '@waldur/navigation/sidebar/ResourcesMenu';
import { Field } from '@waldur/resource/summary';
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
    <Container>
      {counters.length === 0
        ? translate('There are no resources')
        : counters.map((row, index) => (
            <Field key={index} label={row.label} value={row.value} />
          ))}
      <Field label={translate('Backend ID')} value={row.backend_id} />
    </Container>
  );
};
