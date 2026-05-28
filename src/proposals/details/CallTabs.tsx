import { QuestionIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { Call } from '../types';
import { checkIsCallManager } from '../utils';

export const CallTabs = ({ call }: { call: Call }) => {
  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const goTo = (state) =>
    router.stateService.go(state, { call_uuid: call.uuid });

  const user = useUser();
  const canEdit = useMemo(() => {
    if (checkIsOwnerOrStaff({ uuid: call.customer_uuid } as any, user))
      return true;
    if (checkIsCallManager(call, user)) return true;
    return false;
  }, [user]);

  if (!canEdit) return null;

  return (
    <Tab.Container defaultActiveKey={state.name} onSelect={goTo}>
      <Nav variant="tabs" className="nav-line-tabs mb-4">
        {call.state !== 'active' ? (
          <Nav.Item>
            <Tip
              id="tip-public-call-disabled"
              label={translate(
                'The public view is currently inactive as this call is archived or draft.',
              )}
            >
              <Nav.Link disabled className="text-center min-w-60px d-flex">
                {translate('Public')}
                <QuestionIcon size={18} className="ms-1" weight="bold" />
              </Nav.Link>
            </Tip>
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
