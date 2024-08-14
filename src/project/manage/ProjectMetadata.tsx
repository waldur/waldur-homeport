import React from 'react';
import { useSelector } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { FieldEditButton } from './FieldEditButton';

interface ProjectMetadataProps {
  project: Project;
}

export const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  project,
}) => {
  const user = useSelector(getUser);
  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        <FormTable.Item
          label={translate('OECD FoS code')}
          value={
            (project.oecd_fos_2007_code && (
              <span>{`${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`}</span>
            )) ||
            'N/A'
          }
          actions={
            isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) && (
              <FieldEditButton project={project} name="oecd_fos_2007_code" />
            )
          }
        />
        <FormTable.Item
          label={translate('Backend ID')}
          value={project.backend_id || 'N/A'}
          actions={<FieldEditButton project={project} name="backend_id" />}
        />
        <FormTable.Item
          label={translate('Slug')}
          value={project.slug}
          actions={
            user.is_staff ? (
              <FieldEditButton project={project} name="slug" />
            ) : null
          }
        />
      </FormTable>
    </FormTable.Card>
  );
};
