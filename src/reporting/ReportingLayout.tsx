import { UIView, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Nav } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { getCategoryConfig } from './constants';

export const ReportingLayout: FC = () => {
  const router = useRouter();
  const state = useSelector((s) => s);

  const tabs = useMemo(() => {
    const categories = getCategoryConfig();
    const result = [
      { title: translate('Overview'), state: 'reporting-dashboard' },
    ];

    Object.entries(categories).forEach(([key, category]) => {
      if (category.feature && !isFeatureVisible(category.feature)) {
        return;
      }
      if (category.permission && !category.permission(state)) {
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
  }, [state]);

  return (
    <div className="container-fluid py-6">
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1>{translate('Reporting')}</h1>
      </div>

      <Nav
        variant="tabs"
        className="nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold mb-8"
      >
        {tabs.map((tab) => (
          <Nav.Item key={tab.state}>
            <Nav.Link
              as={Link}
              state={tab.state}
              active={router.stateService.includes(tab.state)}
              className="text-active-primary py-3 me-6 text-decoration-none"
            >
              <span>{tab.title}</span>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <UIView />
    </div>
  );
};
