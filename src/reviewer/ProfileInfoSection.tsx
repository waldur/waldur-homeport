import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { FunctionComponent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  reviewerProfilesConnectOrcidRetrieve,
  reviewerProfilesDisconnectOrcid,
  reviewerProfilesSyncOrcid,
  ReviewerProfile,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { OrcidLogo } from '@/core/OrcidLogo';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/hooks';
import { ActionButton } from '@/table/ActionButton';
import { getUser } from '@/workspace/selectors';

const ProfileEditFieldDialog = lazyComponent(() =>
  import('./ProfileEditFieldDialog').then((module) => ({
    default: module.ProfileEditFieldDialog,
  })),
);

interface ProfileInfoSectionProps {
  profile: ReviewerProfile;
  updateProfile: (data: Partial<ReviewerProfile>) => void;
  isUpdating: boolean;
  refetch?: () => void;
}

export const ProfileInfoSection: FunctionComponent<ProfileInfoSectionProps> = ({
  profile,
  refetch,
}) => {
  const queryClient = useQueryClient();
  const currentUser = useSelector(getUser);
  const isStaff = currentUser?.is_staff;
  const { openDialog } = useModal();

  const [isConnectingOrcid, setIsConnectingOrcid] = useState(false);
  const [isSyncingOrcid, setIsSyncingOrcid] = useState(false);
  const [isDisconnectingOrcid, setIsDisconnectingOrcid] = useState(false);
  const { showSuccess, showErrorResponse } = useNotify();

  const handleEditField = useCallback(
    (
      name: 'biography' | 'alternative_names' | 'orcid_id',
      label: string,
      isStaffEdit = false,
    ) => {
      openDialog(ProfileEditFieldDialog, {
        resolve: { profile, name, label, refetch, isStaffEdit },
        size: 'sm',
      });
    },
    [openDialog, profile, refetch],
  );

  const handleConnectOrcid = useCallback(async () => {
    setIsConnectingOrcid(true);
    try {
      const result = await reviewerProfilesConnectOrcidRetrieve({
        path: { uuid: profile.uuid },
      });
      const authUrl = result.data.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      showErrorResponse(error, translate('Unable to connect ORCID.'));
      setIsConnectingOrcid(false);
    }
  }, [profile.uuid, showErrorResponse]);

  const handleSyncOrcid = useCallback(async () => {
    setIsSyncingOrcid(true);
    try {
      await reviewerProfilesSyncOrcid({
        path: { uuid: profile.uuid },
      });
      showSuccess(translate('ORCID data synchronized successfully.'));
      refetch?.();
      queryClient.invalidateQueries({ queryKey: ['reviewerAffiliationsList'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerExpertiseList'] });
      queryClient.invalidateQueries({ queryKey: ['reviewerPublicationsList'] });
      queryClient.invalidateQueries({
        queryKey: ['reviewerAffiliationsCount'],
      });
      queryClient.invalidateQueries({ queryKey: ['reviewerExpertiseCount'] });
      queryClient.invalidateQueries({
        queryKey: ['reviewerPublicationsCount'],
      });
    } catch (error) {
      showErrorResponse(error, translate('Unable to sync ORCID data.'));
    } finally {
      setIsSyncingOrcid(false);
    }
  }, [profile.uuid, showSuccess, showErrorResponse, refetch, queryClient]);

  const handleDisconnectOrcid = useCallback(async () => {
    setIsDisconnectingOrcid(true);
    try {
      await reviewerProfilesDisconnectOrcid({
        path: { uuid: profile.uuid },
      });
      showSuccess(translate('ORCID disconnected successfully.'));
      refetch?.();
    } catch (error) {
      showErrorResponse(error, translate('Unable to disconnect ORCID.'));
    } finally {
      setIsDisconnectingOrcid(false);
    }
  }, [profile.uuid, showSuccess, showErrorResponse, refetch]);

  const renderOrcidValue = () => {
    if (profile.orcid_id) {
      const orcidUrl = `https://orcid.org/${profile.orcid_id}`;
      return (
        <div className="d-flex flex-column">
          <a
            href={orcidUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="d-inline-flex align-items-center gap-1"
            aria-label={`View ORCID record - ${profile.orcid_id}`}
          >
            <OrcidLogo size={16} />
            {orcidUrl}
          </a>
          {profile.orcid_last_sync && (
            <small className="text-muted">
              {translate('Synced {date}', {
                date: formatDateTime(profile.orcid_last_sync),
              })}
            </small>
          )}
        </div>
      );
    }
    return <span className="text-muted">{translate('Not connected')}</span>;
  };

  const renderOrcidActions = () => {
    return (
      <div className="d-flex gap-2">
        {profile.orcid_id ? (
          <>
            <CompactSubmitButton
              type="button"
              variant="outline-primary"
              onClick={handleSyncOrcid}
              submitting={isSyncingOrcid}
              label={translate('Sync ORCID')}
            />
            <CompactSubmitButton
              type="button"
              variant="danger"
              onClick={handleDisconnectOrcid}
              submitting={isDisconnectingOrcid}
              label={translate('Disconnect ORCID')}
            />
          </>
        ) : (
          <CompactSubmitButton
            type="button"
            variant="success"
            onClick={handleConnectOrcid}
            submitting={isConnectingOrcid}
            label={translate('Connect ORCID')}
          />
        )}
        {isStaff && (
          <ActionButton
            action={() =>
              handleEditField('orcid_id', translate('ORCID iD'), true)
            }
            iconNode={<PencilSimpleIcon weight="bold" />}
            variant="secondary"
            className="btn-sm btn-icon"
          />
        )}
      </div>
    );
  };

  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        <FormTable.Item
          label={translate('ORCID iD')}
          value={renderOrcidValue()}
          actions={renderOrcidActions()}
        />
        <FormTable.Item
          label={translate('Biography')}
          value={
            profile.biography || (
              <span className="text-muted">{translate('Not provided')}</span>
            )
          }
          actions={
            <ActionButton
              action={() =>
                handleEditField('biography', translate('Biography'))
              }
              iconNode={<PencilSimpleIcon weight="bold" />}
              variant="secondary"
              className="btn-sm btn-icon"
            />
          }
        />
        <FormTable.Item
          label={translate('Alternative names')}
          value={
            (profile.alternative_names as string) || (
              <span className="text-muted">{translate('Not provided')}</span>
            )
          }
          actions={
            <ActionButton
              action={() =>
                handleEditField(
                  'alternative_names',
                  translate('Alternative names'),
                )
              }
              iconNode={<PencilSimpleIcon weight="bold" />}
              variant="secondary"
              className="btn-sm btn-icon"
            />
          }
        />
        <FormTable.Item
          label={translate('Reviews completed')}
          value={profile.stats?.total_reviews_completed ?? 0}
        />
        {profile.stats?.average_review_time_days && (
          <FormTable.Item
            label={translate('Average review time')}
            value={translate('{days} days', {
              days: profile.stats.average_review_time_days.toFixed(1),
            })}
          />
        )}
      </FormTable>
    </FormTable.Card>
  );
};
