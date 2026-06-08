import { useQuery } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import {
  Project,
  projectsChecklistRetrieve,
  projectsPartialUpdate,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { CompactEditButton } from '@/form/CompactEditButton';
import {
  EditFieldProvider,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { CHECKLIST_NO_CONFIGURED_MSG } from '@/marketplace-checklist/constants';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';
import { useSetProject, useUser } from '@/workspace/hooks';

import { ParsedAnswer } from '../metadata/ParsedAnswer';
import { OECD_FOS_2007_CODES } from '../OECD_FOS_2007_CODES';

import { EditScienceDomainDialog } from './EditScienceDomainDialog';
import { MetadataEditButton } from './MetadataEditButton';

const UpdateAffiliationDialog = lazyComponent(() =>
  import('./UpdateAffiliationDialog').then((module) => ({
    default: module.UpdateAffiliationDialog,
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
  const setProject = useSetProject();
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

  const canUpdateMetadata = hasPermission(user, {
    permission: PermissionEnum.UPDATE_PROJECT_METADATA,
    customerId: project.customer_uuid,
    projectId: project.uuid,
  });

  const canUpdateProject =
    user.is_staff ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: project.customer_uuid,
      projectId: project.uuid,
    });

  const affiliation = project.affiliation;
  const affiliationDisplay = affiliation
    ? affiliation.abbreviation
      ? `${affiliation.name} (${affiliation.abbreviation})`
      : affiliation.name
    : null;

  const openAffiliationDialog = useCallback(() => {
    openDialog(UpdateAffiliationDialog, {
      resolve: { project },
      size: 'lg',
    });
  }, [project]);

  const updateProject = useCallback(
    async (formData) => {
      try {
        const res = await projectsPartialUpdate({
          path: { uuid: project.uuid },
          body: formData,
        });
        setProject(res.data);
        return res;
      } catch (error) {
        showErrorResponse(error, translate('Unable to update project.'));
        throw error;
      }
    },
    [project.uuid, setProject, showErrorResponse],
  );

  return (
    <EditFieldProvider scope={project} callback={updateProject}>
      <FormTable.Card className="card-bordered">
        <FormTable hideActions={!canUpdateProject}>
          {isFeatureVisible(ProjectFeatures.oecd_fos_2007_code) && (
            <SelectEditField
              name="oecd_fos_2007_code"
              label={translate('OECD FoS code')}
              options={OECD_FOS_2007_CODES}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => `${option.value}. ${option.label}`}
              simpleValue
              isClearable
              renderValue={() =>
                project.oecd_fos_2007_code
                  ? renderFieldOrDash(
                      `${project.oecd_fos_2007_code}. ${project.oecd_fos_2007_label}`,
                    )
                  : renderFieldOrDash(null)
              }
            />
          )}

          {isFeatureVisible(ProjectFeatures.science_domain) && (
            <FormTable.Item
              label={translate('Science domain')}
              value={renderFieldOrDash(
                project.science_domain_name && project.science_sub_domain_name
                  ? `${project.science_domain_name} > ${project.science_sub_domain_name}`
                  : null,
              )}
              actions={
                <CompactEditButton
                  onClick={() =>
                    openDialog(EditScienceDomainDialog, {
                      resolve: { project },
                    })
                  }
                  disabled={project.is_removed}
                />
              }
            />
          )}

          <StringEditField name="backend_id" label={translate('Backend ID')} />

          <StringEditField name="slug" label={translate('Slug')} isStaffOnly />

          <FormTable.Item
            label={translate('Affiliation')}
            value={renderFieldOrDash(affiliationDisplay)}
            actions={
              <CompactEditButton
                onClick={openAffiliationDialog}
                disabled={project.is_removed}
                tooltip={
                  project.is_removed
                    ? translate('Action is disabled for removed project')
                    : undefined
                }
                variant="secondary"
              />
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
    </EditFieldProvider>
  );
};
