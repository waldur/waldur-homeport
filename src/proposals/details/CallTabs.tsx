import { Question } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { Nav, Tab } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { Call } from '../types';

export const CallTabs = ({ call }: { call: Call }) => {
  const router = useRouter();
  const { state } = useCurrentStateAndParams();
  const goTo = (state) =>
    router.stateService.go(state, { call_uuid: call.uuid });

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
              <Nav.Link disabled className="text-center w-60px">
                {translate('Public')}
                <Question size={18} className="ms-1" />
              </Nav.Link>
            </Tip>
          </Nav.Item>
        ) : (
          <Nav.Item>
            <Nav.Link
              eventKey="public-calls.details"
              className="text-center w-60px"
            >
              {translate('Public')}
            </Nav.Link>
          </Nav.Item>
        )}
        <Nav.Item>
          <Nav.Link
            eventKey="protected-call.main"
            className="text-center w-60px"
          >
            {translate('Edit')}
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </Tab.Container>
  );
};
