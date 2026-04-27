import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  affiliatedOrganizationsList,
  Project,
  projectsRetrieve,
  projectsUpdateAffiliatedOrganizations,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { setCurrentProject } from '@/workspace/actions';

interface UpdateAffiliatedOrganizationsDialogProps {
  resolve: {
    project: Project;
  };
}

export const UpdateAffiliatedOrganizationsDialog: FunctionComponent<
  UpdateAffiliatedOrganizationsDialogProps
> = ({ resolve: { project } }) => {
  const dispatch = useDispatch();

  const {
    data: allOrgs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['affiliatedOrganizations'],
    queryFn: () =>
      affiliatedOrganizationsList({ query: { page_size: 200 } }).then(
        (res) => res.data,
      ),
    staleTime: SHORT_STALE_TIME,
  });

  const currentOrgUuids = useMemo(
    () => new Set(project.affiliated_organizations?.map((o) => o.uuid) || []),
    [project],
  );

  const [selectedUuids, setSelectedUuids] =
    useState<Set<string>>(currentOrgUuids);
  const [submitting, setSubmitting] = useState(false);

  const toggleOrg = useCallback((uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const selectedOrgs = allOrgs?.filter((o) => selectedUuids.has(o.uuid));
      await projectsUpdateAffiliatedOrganizations({
        path: { uuid: project.uuid },
        body: {
          affiliated_organizations: selectedOrgs?.map((o) => o.uuid) || [],
        },
      });
      const response = await projectsRetrieve({
        path: { uuid: project.uuid },
      });
      dispatch(setCurrentProject(response.data as unknown as Project));
      dispatch(
        showSuccess(translate('Affiliated organizations have been updated.')),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to update affiliated organizations.'),
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }, [allOrgs, selectedUuids, project.uuid, dispatch]);

  return (
    <ModalDialog
      title={translate('Update affiliated organizations')}
      closeButton
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={submitting}
            submitting={submitting}
            label={translate('Save')}
            onClick={handleSubmit}
          />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Unable to load affiliated organizations.')}
          loadData={refetch}
        />
      ) : allOrgs?.length === 0 ? (
        <p className="text-muted">
          {translate(
            'No affiliated organizations have been created yet. Ask an administrator to create them first.',
          )}
        </p>
      ) : (
        <div className="mh-300px scroll-y">
          {allOrgs?.map((org) => (
            <div
              key={org.uuid}
              className="d-flex align-items-center p-3 cursor-pointer hover-bg-light rounded"
            >
              <FormCheck
                type="checkbox"
                id={`affiliated-org-${org.uuid}`}
                checked={selectedUuids.has(org.uuid)}
                onChange={() => toggleOrg(org.uuid)}
                className="me-3"
                label={
                  <span>
                    <span className="fw-bold">{org.name}</span>
                    {org.abbreviation && (
                      <span className="text-muted ms-2">
                        ({org.abbreviation})
                      </span>
                    )}
                    {org.country && (
                      <span className="text-muted ms-2">{org.country}</span>
                    )}
                  </span>
                }
              />
            </div>
          ))}
        </div>
      )}
    </ModalDialog>
  );
};
