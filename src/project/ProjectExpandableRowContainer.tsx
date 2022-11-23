import React from 'react';
import { Container } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Field } from '@waldur/resource/summary';
import { Project } from '@waldur/workspace/types';

import { getProjectCounters } from './api';
import { ProjectCounterResourceItem } from './types';
import { combineProjectCounterRows, parseProjectCounters } from './utils';

async function loadData(props): Promise<ProjectCounterResourceItem[]> {
  const categories = await getCategories({
    params: { field: ['uuid', 'title'] },
  });
  const counters = await getProjectCounters(props.uuid);
  const counterRows = parseProjectCounters(categories, counters);
  return combineProjectCounterRows(counterRows);
}

export const ProjectExpandableRowContainer: React.FC<{
  row: Project;
}> = (props) => {
  const { loading, error, value } = useAsync(
    () => loadData(props.row),
    [props.row],
  );
  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load project resources.')}</>;
  } else {
    return (
      <Container>
        {value.map((row, index) => (
          <Field key={index} label={row.label} value={row.value} />
        ))}
        <Field label={translate('Backend ID')} value={props.row.backend_id} />
      </Container>
    );
  }
};
