import { FC } from 'react';

import { translate } from '@/i18n';

/** The order that keeps existing groups' GIDs when project groups start. */
export const ProjectGroupsRolloutOrder: FC = () => (
  <ol className="mb-0 ps-4">
    <li>
      {translate(
        'Set a project group GID range on the service provider’s POSIX ID pool.',
      )}
    </li>
    <li>
      {translate(
        'Adopt the groups your directory already holds, with their GIDs, under Accounts > Project groups.',
      )}
    </li>
    <li>
      {translate(
        'Enable project groups: every project with a resource on your offerings then gets a group, with the next free GID from the range.',
      )}
    </li>
  </ol>
);
