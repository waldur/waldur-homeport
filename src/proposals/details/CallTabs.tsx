import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';

import { TabNav } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';
import { canAccessCallManagement, canOpenCallEditPage } from '../utils';

export const CallTabs = ({ call }: { call: Call }) => {
  const { state } = useCurrentStateAndParams();
  const params = { call_uuid: call.uuid };

  const user = useUser();
  // Who gets the call's management tab strip -- the same rules that guard the
  // pages themselves: `canAccessCallManagement` for Manage (editors,
  // organization owners for team management, support read-only), and
  // `canOpenCallEditPage` for Edit, which also admits a round closer.
  const canManage = useMemo(
    () => canAccessCallManagement(user, call),
    [user, call],
  );
  const canEdit = useMemo(() => canOpenCallEditPage(user, call), [user, call]);

  if (!canEdit) return null;

  return (
    <TabNav
      activeKey={state.name}
      listClassName="mb-4"
      items={[
        call.state !== 'active'
          ? {
              key: 'public-call.details',
              title: (
                <>
                  {translate('Public')}
                  <QuestionIcon size={18} className="ms-1" weight="bold" />
                </>
              ),
              disabled: true,
              tooltip: translate(
                'The public view is currently inactive as this call is archived or draft.',
              ),
              className: 'text-center min-w-60px',
            }
          : {
              key: 'public-call.details',
              title: translate('Public'),
              link: <Link state="public-call.details" params={params} />,
              className: 'text-center min-w-60px',
            },
        ...(canManage
          ? [
              {
                key: 'protected-call.manage',
                title: translate('Manage'),
                link: <Link state="protected-call.manage" params={params} />,
                className: 'text-center min-w-60px',
              },
            ]
          : []),
        {
          key: 'protected-call.main',
          title: translate('Edit'),
          link: <Link state="protected-call.main" params={params} />,
          className: 'text-center min-w-60px',
        },
      ]}
    />
  );
};
