import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

/** The usernames a project group lists as its members. */
export const ProjectGroupMembers: FC<{ members?: string[] }> = ({
  members,
}) => (
  <div className="px-3 py-1.5">
    <div className="font-medium mb-1.5">{translate('Members')}</div>
    {members?.length ? (
      <div className="flex flex-wrap gap-1.5">
        {members.map((username) => (
          <Badge key={username} variant="neutral" tone="outline">
            {username}
          </Badge>
        ))}
      </div>
    ) : (
      <p className="text-quaternary text-xs mb-0">
        {translate(
          'No members: nobody in the project has an active account at this service provider.',
        )}
      </p>
    )}
  </div>
);
