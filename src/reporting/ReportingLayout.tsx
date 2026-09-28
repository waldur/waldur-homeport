import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, createContext, useMemo, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { SegmentedControl } from 'waldur-ui';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';

import { getReportingTabs } from './tabs';

export const ReportingPeriodContext = createContext(0);

export const ReportingLayout: FC = () => {
  useFullPage();
  const router = useRouter();
  const workspace = useSelector((s: any) => s.workspace);
  const [months, setMonths] = useState(0);
  // Subscribes to transitions, so the tab highlight and the toggle below
  // re-render on navigation rather than relying on an ancestor to do it.
  const { state } = useCurrentStateAndParams();
  const isDashboard = state.name === 'reporting-dashboard';

  const tabs = useMemo(() => getReportingTabs(workspace), [workspace]);

  return (
    <div className="container-fluid py-9">
      <div className="d-flex justify-content-between align-items-center gap-4 mb-5">
        <h1>{translate('Reporting')}</h1>
        {isDashboard && (
          <SegmentedControl<number>
            aria-label={translate('Time period')}
            options={[
              { value: 0, label: translate('All time') },
              { value: 6, label: translate('6 months') },
              { value: 12, label: translate('12 months') },
            ]}
            value={months}
            onValueChange={setMonths}
          />
        )}
      </div>

      <Nav variant="tabs" className="nav-line-tabs fs-5 fw-bold mb-5">
        {tabs.map((tab) => (
          <Nav.Item key={tab.state}>
            <Nav.Link
              as={Link}
              state={tab.state}
              active={router.stateService.includes(tab.state)}
              className="text-decoration-none"
            >
              <span>{tab.title}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <ReportingPeriodContext.Provider value={months}>
        <UIView />
      </ReportingPeriodContext.Provider>
    </div>
  );
};
