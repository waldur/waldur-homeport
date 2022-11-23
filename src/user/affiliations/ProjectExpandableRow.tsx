import React from 'react';
import { Container } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { getProject, loadOecdCodes } from '@waldur/project/api';
import {
  combineProjectCounterRows,
  parseProjectCounters,
} from '@waldur/project/utils';
import { Field } from '@waldur/resource/summary';
import { ProjectPermission } from '@waldur/workspace/types';

import { PermissionDetails } from './PermissionDetails';

async function loadData(project: ProjectPermission) {
  const _project = await getProject(project.project_uuid);
  const categories = await getCategories({
    params: { field: ['uuid', 'title'], page_size: 100 },
  });
  const oecdCodes = await loadOecdCodes();

  const oecdCode = oecdCodes.find(
    (item) => item.value === _project.oecd_fos_2007_code,
  );
  const counters = _project.marketplace_resource_count;
  const counterRows = parseProjectCounters(categories, counters);

  return {
    project: _project,
    oecdCode,
    resourceCounters: combineProjectCounterRows(counterRows),
  };
}

export const ProjectExpandableRow: React.FC<{
  row: ProjectPermission;
}> = ({ row }) => {
  const { loading, error, value } = useAsync(() => loadData(row), [row]);
  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load project resources.')}</>;
  } else {
    return (
      <Container>
        <PermissionDetails row={row} />
        {value.resourceCounters.map((row, index) => (
          <Field key={index} label={row.label} value={row.value} />
        ))}
        <Field
          label={translate('Backend ID')}
          value={value.project.backend_id}
        />
        <Field label={translate('OECD FoS code')} value={value.oecdCode} />
        <Field
          label={translate('Industry project')}
          value={value.project.is_industry ? translate('Yes') : translate('No')}
        />
        {isFeatureVisible('project.estimated_cost') && (
          <Field
            label={translate('Cost estimation')}
            value={defaultCurrency(
              (value.project.billing_price_estimate &&
                value.project.billing_price_estimate.total) ||
                0,
            )}
          />
        )}
      </Container>
    );
  }
};
