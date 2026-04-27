import { WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Link } from '@/core/Link';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';

interface ProfileRequiredMessageProps {
  hasProfile: boolean;
  isPublished: boolean;
  onPublish?: () => void;
  isPublishing?: boolean;
}

export const ProfileRequiredMessage: FC<ProfileRequiredMessageProps> = ({
  hasProfile,
  isPublished,
  onPublish,
  isPublishing,
}) => {
  if (hasProfile && isPublished) {
    return null;
  }

  return (
    <Card className="card-bordered mb-6">
      <Card.Body className="text-center py-10">
        <div className="mb-4">
          <WarningIcon size={64} className="text-warning" weight="duotone" />
        </div>
        <h3 className="mb-4">{translate('Profile required')}</h3>
        <p className="text-muted mb-6">
          {translate(
            'To accept this invitation, you need to complete the following steps:',
          )}
        </p>
        <div className="d-flex flex-column align-items-center gap-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className={`badge ${hasProfile ? 'bg-success' : 'bg-secondary'} rounded-circle p-2`}
            >
              {hasProfile ? '✓' : '1'}
            </div>
            <span className={hasProfile ? 'text-success' : ''}>
              {translate('Create your reviewer profile')}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div
              className={`badge ${isPublished ? 'bg-success' : 'bg-secondary'} rounded-circle p-2`}
            >
              {isPublished ? '✓' : '2'}
            </div>
            <span className={isPublished ? 'text-success' : ''}>
              {translate('Publish your profile')}
            </span>
          </div>
        </div>
        <div className="mt-8">
          {!hasProfile ? (
            <Link state="profile.reviewer" className="btn btn-primary">
              {translate('Create reviewer profile')}
            </Link>
          ) : !isPublished ? (
            <SubmitButton
              type="button"
              variant="primary"
              onClick={onPublish}
              submitting={isPublishing}
              label={translate('Publish profile')}
            />
          ) : null}
        </div>
        {hasProfile && !isPublished && (
          <p className="text-muted mt-4 small">
            {translate(
              'Publishing your profile will make it visible to call managers for reviewer discovery.',
            )}
          </p>
        )}
      </Card.Body>
    </Card>
  );
};
