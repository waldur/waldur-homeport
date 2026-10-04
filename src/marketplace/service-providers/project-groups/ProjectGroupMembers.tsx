import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

/** The usernames a project group lists as its members. */
export const ProjectGroupMembers: FC<{ members?: string[] }> = ({
  members,
}) => (
  <div className="px-4 py-2">
    <div className="fw-bold mb-2">{translate('Members')}</div>
    {members?.length ? (
      <div className="d-flex flex-wrap gap-2">
        {members.map((username) => (
          <Badge key={username} variant="neutral" tone="light">
            {username}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-muted fs-7 mb-0">
        {translate(
          'No members: nobody in the project has an active account at this service provider.',
        )}
      </p>
    )}
  </div>
);
