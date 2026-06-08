import { FunctionComponent, useCallback } from 'react';
import {
  reviewerProfilesMePartialUpdate,
  reviewerProfilesPartialUpdate,
  ReviewerProfile,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { OrcidLogo } from '@/core/OrcidLogo';
import {
  EditFieldProvider,
  StringEditField,
  TextEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { ConnectOrcidAction } from './ConnectOrcidAction';
import { DisconnectOrcidAction } from './DisconnectOrcidAction';
import { SyncOrcidAction } from './SyncOrcidAction';

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
  const currentUser = useUser();
  const isStaff = currentUser?.is_staff;
  const { showErrorResponse } = useNotify();

  const updateProfileCallback = useCallback(
    async (formData: Record<string, any>) => {
      try {
        const fieldName = Object.keys(formData)[0];
        const value = formData[fieldName] || null;
        let response;
        if (fieldName === 'orcid_id' && isStaff) {
          response = await reviewerProfilesPartialUpdate({
            path: { uuid: profile.uuid },
            body: { [fieldName]: value },
          });
        } else {
          response = await reviewerProfilesMePartialUpdate({
            body: { [fieldName]: value },
          });
        }
        if (refetch) {
          refetch();
        }
        return response;
      } catch (error) {
        showErrorResponse(error, translate('Unable to update profile.'));
        throw error;
      }
    },
    [profile.uuid, isStaff, refetch, showErrorResponse],
  );

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
            <SyncOrcidAction profile={profile} refetch={refetch} />
            <DisconnectOrcidAction profile={profile} refetch={refetch} />
          </>
        ) : (
          <ConnectOrcidAction profile={profile} />
        )}
      </div>
    );
  };

  return (
    <EditFieldProvider scope={profile} callback={updateProfileCallback}>
      <FormTable bordered={false}>
        <StringEditField
          name="orcid_id"
          label={translate('ORCID iD')}
          placeholder="0000-0000-0000-0000"
          description={translate('Format: 0000-0000-0000-0000')}
          renderValue={renderOrcidValue}
          actions={renderOrcidActions()}
          isStaffOnly
        />
        <TextEditField
          name="biography"
          label={translate('Biography')}
          rows={4}
          renderValue={(value) =>
            value || (
              <span className="text-muted">{translate('Not provided')}</span>
            )
          }
        />
        <StringEditField
          name="alternative_names"
          label={translate('Alternative names')}
          renderValue={(value) =>
            value || (
              <span className="text-muted">{translate('Not provided')}</span>
            )
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
    </EditFieldProvider>
  );
};
