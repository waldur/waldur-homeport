import { UIView, useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Nav } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { translate } from '@/i18n';
import { useFullPage } from '@/navigation/context';

import { getCategoryConfig } from './constants';

export const ReportingLayout: FC = () => {
  useFullPage();
  const router = useRouter();
  const workspace = useSelector((s: any) => s.workspace);

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
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-5">
        <h1>{translate('Reporting')}</h1>
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

      <UIView />
    </div>
  );
};
