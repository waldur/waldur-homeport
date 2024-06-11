import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { Project } from '@waldur/workspace/types';

import { FormGroup } from '../offerings/FormGroup';

import { ProjectSelectField } from './ProjectSelectField';
import { orderCustomerSelector } from './utils';

interface ProjectFieldProps {
  previewMode?: boolean;
  hideLabel?: boolean;
}

export const ProjectField: FC<ProjectFieldProps> = ({
  previewMode,
  hideLabel,
}) => {
  const customer = useSelector(orderCustomerSelector);
  const query = useQuery(
    ['ProjectField', customer?.uuid],
    () =>
      getAll<Project>('/projects/', {
        params: { customer: customer.uuid },
      }),
    { enabled: Boolean(customer?.uuid) },
  );
  if (!customer) {
    return translate('Please select organization first.');
  }
  if (query.isLoading) {
    return <LoadingSpinner />;
  }
  return (
    <FormGroup
      label={hideLabel ? undefined : translate('Project')}
      required={true}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {query.data?.length > 0 && (
          <div style={{ flexGrow: 1, marginRight: 10 }}>
            <ProjectSelectField projects={query.data} />
          </div>
        )}
        {!previewMode && <ProjectCreateButton />}
      </div>
    </FormGroup>
  );
};
