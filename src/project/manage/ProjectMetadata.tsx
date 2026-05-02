import { useQuery } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { Project, projectsChecklistRetrieve } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { CompactEditButton } from '@/form/CompactEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@/marketplace-checklist/constants';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { usePermission } from '@/permissions/hooks';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { ParsedAnswer } from '../metadata/ParsedAnswer';

import { FieldEditButton } from './FieldEditButton';
import { MetadataEditButton } from './MetadataEditButton';

const UpdateAffiliatedOrganizationsDialog = lazyComponent(() =>
  import('./UpdateAffiliatedOrganizationsDialog').then((module) => ({
    default: module.UpdateAffiliatedOrganizationsDialog,
  })),
);

const getMetadataLoadErrorMsg = () =>
  translate('Unable to load full metadata.');

interface ProjectMetadataProps {
  project: Project;
}

export const ProjectMetadata: React.FC<ProjectMetadataProps> = ({
  project,
}) => {
  const { openDialog } = useModal();
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
    staleTime: UI_STALE_TIME,
    retry: false,
  });

  const hasPermission = usePermission();
  const canUpdateMetadata = hasPermission({
    permission: PermissionEnum.UPDATE_PROJECT_METADATA,
    customerId: project.customer_uuid,
    projectId: project.uuid,
  });

  const canUpdateProject =
    user.is_staff ||
    hasPermission({
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: project.customer_uuid,
      projectId: project.uuid,
    });

  const affiliatedOrgsDisplay = project.affiliated_organizations?.length
    ? project.affiliated_organizations
        .map((org) =>
          org.abbreviation ? `${org.name} (${org.abbreviation})` : org.name,
        )
        .join(', ')
    : null;

  const openAffiliatedOrgsDialog = useCallback(() => {
    openDialog(UpdateAffiliatedOrganizationsDialog, {
      resolve: { project },
      size: 'lg',
    });
  }, [project]);

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

        {isFeatureVisible(ProjectFeatures.science_domain) && (
          <FormTable.Item
            label={translate('Science domain')}
            value={renderFieldOrDash(
              project.science_domain_name && project.science_sub_domain_name
                ? `${project.science_domain_name} > ${project.science_sub_domain_name}`
                : null,
            )}
            actions={
              <FieldEditButton project={project} name="science_sub_domain" />
            }
          />
        )}

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

        <FormTable.Item
          label={translate('Affiliated organizations')}
          value={renderFieldOrDash(affiliatedOrgsDisplay)}
          actions={
            canUpdateProject ? (
              <CompactEditButton
                onClick={openAffiliatedOrgsDialog}
                disabled={project.is_removed}
                tooltip={
                  project.is_removed
                    ? translate('Action is disabled for removed project')
                    : undefined
                }
                variant="secondary"
              />
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
