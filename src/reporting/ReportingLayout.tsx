import { UIView, useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, createContext, useMemo, useState } from 'react';
import { Nav, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';

import { getCategoryConfig } from './constants';

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

  const tabs = useMemo(() => {
    const categories = getCategoryConfig();
    const result = [
      { title: translate('Overview'), state: 'reporting-dashboard' },
    ];

    Object.entries(categories).forEach(([key, category]) => {
      if (category.feature && !isFeatureVisible(category.feature)) {
        return;
      }
      if (category.permission && !category.permission({ workspace } as any)) {
        return;
      }
      if (category.reports.length > 0) {
        result.push({
          title: category.title,
          state: `reporting-${key}-list`,
        });
      }
    });

    return result;
  }, [workspace]);

  return (
    <div className="container-fluid py-9">
      <div className="d-flex justify-content-between align-items-center gap-4 mb-5">
        <h1>{translate('Reporting')}</h1>
        {isDashboard && (
          <ToggleButtonGroup
            type="radio"
            name="period"
            value={months}
            onChange={setMonths}
          >
            <ToggleButton id="period-0" value={0} variant="tertiary">
              {translate('All time')}
            </ToggleButton>
            <ToggleButton id="period-6" value={6} variant="tertiary">
              {translate('6 months')}
            </ToggleButton>
            <ToggleButton id="period-12" value={12} variant="tertiary">
              {translate('12 months')}
            </ToggleButton>
          </ToggleButtonGroup>
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
