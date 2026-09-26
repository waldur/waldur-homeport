import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';

import { Call } from '../types';
import { canAccessCallManagement } from '../utils';

export const CallTabs = ({ call }: { call: Call }) => {
  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const goTo = (state) =>
    router.stateService.go(state, { call_uuid: call.uuid });

  const user = useUser();
  // Who gets the call's management tab strip -- the same rule that guards the
  // pages themselves, see `canAccessCallManagement`: editors, organization
  // owners (team management only) and support (read-only).
  const canManage = useMemo(
    () => canAccessCallManagement(user, call),
    [user, call],
  );

  if (!canManage) return null;

  return (
    <Tab.Container defaultActiveKey={state.name} onSelect={goTo}>
      <Nav variant="tabs" className="nav-line-tabs mb-4">
        {call.state !== 'active' ? (
          <Nav.Item>
            <Tooltip
              label={translate(
                'The public view is currently inactive as this call is archived or draft.',
              )}
            >
              <span>
                <Nav.Link disabled className="text-center min-w-60px d-flex">
                  {translate('Public')}
                  <QuestionIcon size={18} className="ms-1" weight="bold" />
                </Nav.Link>
              </span>
            </Tooltip>
          </Nav.Item>
        ) : (
          <Nav.Item>
            <Nav.Link
              eventKey="public-call.details"
              className="text-center min-w-60px"
            >
              {translate('Public')}
            </Nav.Link>
          </Nav.Item>
        )}
        <Nav.Item>
          <Nav.Link
            eventKey="protected-call.manage"
            className="text-center min-w-60px"
          >
            {translate('Manage')}
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            eventKey="protected-call.main"
            className="text-center min-w-60px"
          >
            {translate('Edit')}
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Tab.Container>
  );
};
