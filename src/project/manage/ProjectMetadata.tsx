import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Project, projectsChecklistRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@waldur/marketplace-checklist/constants';
import { PermissionEnum } from '@waldur/permissions/enums';
import { usePermission } from '@waldur/permissions/hooks';
import { useNotify } from '@waldur/store/hooks';
import { renderFieldOrDash } from '@waldur/table/utils';
import { useUser } from '@waldur/workspace/hooks';

import { ParsedAnswer } from '../metadata/ParsedAnswer';

import { FieldEditButton } from './FieldEditButton';
import { MetadataEditButton } from './MetadataEditButton';

const getMetadataLoadErrorMsg = () =>
  translate('Unable to load full metadata.');

interface ProjectMetadataProps {
  project: Project;
}

export const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  project,
}) => {
  const user = useUser();
  const { showErrorResponse } = useNotify();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projectChecklist', project.uuid],
    queryFn: () =>
      projectsChecklistRetrieve({ path: { uuid: project.uuid } })
        .then((response) => response.data)
        .catch((err) => {
          if (err.detail !== CHECKLIST_NO_CONFIGURED_MSG) {
            showErrorResponse(err, getMetadataLoadErrorMsg());
          }
          throw err;
        }),
    staleTime: 3 * 60 * 1000,
    retry: false,
  });

  const hasPermission = usePermission();
  const canUpdateMetadata = hasPermission({
    permission: PermissionEnum.UPDATE_PROJECT_METADATA,
    customerId: project.customer_uuid,
    projectId: project.uuid,
  });

  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        <FormTable.Item
          label={translate('OECD FoS code')}
          value={renderFieldOrDash(
            project.oecd_fos_2007_code && (
              <span>{`${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`}</span>
            ),
          )}
          actions={
            isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) && (
              <FieldEditButton project={project} name="oecd_fos_2007_code" />
            )
          }
        />

        <FormTable.Item
          label={translate('Backend ID')}
          value={renderFieldOrDash(project.backend_id)}
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

        {error &&
        (error as any)?.detail !== CHECKLIST_NO_CONFIGURED_MSG &&
        !isLoading ? (
          <FormTable.Item
            value={
              <LoadingErred
                message={getMetadataLoadErrorMsg()}
                loadData={refetch}
              />
            }
          />
        ) : data?.questions?.length ? (
          data.questions.map((question) => (
            <FormTable.Item
              key={question.uuid}
              label={question.description}
              value={
                <ParsedAnswer
                  question={question as any}
                  answer={question.existing_answer as any}
                />
              }
              actions={
                canUpdateMetadata && (
                  <MetadataEditButton
                    project={project}
                    question={question}
                    refetch={refetch}
                  />
                )
              }
            />
          ))
        ) : null}
      </FormTable>
    </FormTable.Card>
  );
};
