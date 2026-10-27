import { WarningIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Badge, BaseButton } from 'waldur-ui';

import { Link } from '@/core/Link';
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
    <Card className="card-bordered mb-5">
      <Card.Body className="text-center py-8">
        <div className="mb-3">
          <WarningIcon size={64} className="text-warning" weight="duotone" />
        </div>
        <h3 className="mb-3">{translate('Profile required')}</h3>
        <p className="text-quaternary mb-5">
          {translate(
            'To accept this invitation, you need to complete the following steps:',
          )}
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Badge
              variant={hasProfile ? 'success' : 'secondary'}
              shape="circle"
              tone="outline"
              className="p-1.5"
            >
              {hasProfile ? '✓' : '1'}
            </Badge>
            <span className={hasProfile ? 'text-success' : ''}>
              {translate('Create your reviewer profile')}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Badge
              variant={isPublished ? 'success' : 'secondary'}
              shape="circle"
              tone="outline"
              className="p-1.5"
            >
              {isPublished ? '✓' : '2'}
            </Badge>
            <span className={isPublished ? 'text-success' : ''}>
              {translate('Publish your profile')}
            </span>
          </div>
        </div>
        <div className="mt-6">
          {!hasProfile ? (
            <Link
              state="profile-manage"
              params={{ tab: 'reviewer-profile' }}
              buttonVariant="primary"
            >
              {translate('Create reviewer profile')}
            </Link>
          ) : !isPublished ? (
            <BaseButton
              variant="primary"
              onClick={onPublish}
              pending={isPublishing}
              label={translate('Publish profile')}
              size="lg"
            />
          ) : null}
        </div>
        {hasProfile && !isPublished && (
          <p className="text-quaternary mt-3 small">
            {translate(
              'Publishing your profile will make it visible to call managers for reviewer discovery.',
            )}
          </p>
        )}
      </Card.Body>
    </Card>
  );
};
