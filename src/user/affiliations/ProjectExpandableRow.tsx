import React from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { useOfferingCategories } from '@waldur/navigation/sidebar/ResourcesMenu';
import {
  combineProjectCounterRows,
  parseProjectCounters,
} from '@waldur/project/utils';
import { Field } from '@waldur/resource/summary';
import { getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { PermissionDetails } from './PermissionDetails';

export const ProjectExpandableRow: React.FC<{
  row: Project;
}> = ({ row }) => {
  const user = useSelector(getUser);
  const categories = useOfferingCategories();
  const counterRows = parseProjectCounters(
    categories || [],
    row.marketplace_resource_count,
  );
  const counters = combineProjectCounterRows(counterRows);
  return (
    <Container>
      {user.permissions
        .filter(
          (perm) =>
            perm.scope_type === 'project' && perm.scope_uuid === row.uuid,
        )
        .map((permission, index) => (
          <PermissionDetails key={index} permission={permission} />
        ))}
      {counters.map((row, index) => (
        <Field key={index} label={row.label} value={row.value} />
      ))}
      <Field label={translate('Description')} value={row.description} />
    </Container>
  );
};
