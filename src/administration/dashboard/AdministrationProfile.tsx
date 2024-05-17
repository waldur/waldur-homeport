import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback } from 'react';
import { Card, Col, Form, Row, Stack } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { fixURL } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { DashboardHeroLogo } from '@waldur/dashboard/hero/DashboardHeroLogo';
import { translate } from '@waldur/i18n';
import { getUsers } from '@waldur/marketplace/common/api';
import { getRoleFilterOptions } from '@waldur/user/support/utils';

import { getVersion } from '../api';

interface AdministrationProfileProps {
  healthy: boolean;
  supportOnly?: boolean;
}

export const AdministrationProfile = ({
  healthy,
  supportOnly,
}: AdministrationProfileProps) => {
  const router = useRouter();

  const image = fixURL('/icons/login_logo/');
  const website = ENV.plugins.WALDUR_CORE.HOMEPORT_URL;
  const email = ENV.plugins.WALDUR_CORE.SITE_EMAIL;
  const phone = ENV.plugins.WALDUR_CORE.SITE_PHONE;

  const { data: version } = useQuery(['version'], () => getVersion(), {
    staleTime: Infinity,
  });

  const { value, loading } = useAsync(() => {
    const promises = [
      !supportOnly && getUsers({ page: 1, page_size: 6, is_staff: true }),
      getUsers({ page: 1, page_size: 6, is_support: true }),
    ];
    return Promise.all(promises);
  });

  const [staff, supports] = value || [];

  const goToUsers = useCallback(
    (isStaff = false, isSupport = false) => {
      const filter = {};
      const role = [];
      if (isStaff)
        role.push(
          getRoleFilterOptions().find((option) => option.value === 'is_staff'),
        );
      if (isSupport)
        role.push(
          getRoleFilterOptions().find(
            (option) => option.value === 'is_support',
          ),
        );
      if (role.length > 0)
        Object.assign(filter, { role: JSON.stringify(role) });
      router.stateService.go('admin-user-users', filter);
    },
    [router],
  );

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto" className="mb-4">
            <DashboardHeroLogo
              logo={image}
              logoAlt={ENV.plugins.WALDUR_CORE.SITE_NAME}
              logoTopLabel={healthy ? translate('Healthy') : translate('Error')}
              logoBottomLabel="Operator"
              logoTopClass={healthy ? 'bg-success' : 'bg-danger'}
              logoBottomClass="bg-secondary"
            />
          </Col>
          <Col>
            <Row className="my-6 mt-md-0">
              <Col>
                <h2>{ENV.plugins.WALDUR_CORE.SITE_NAME}</h2>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  {version?.version && (
                    <span>
                      {translate('Version')}&nbsp;{version.version}
                    </span>
                  )}
                  {!supportOnly && website && <span>{website}</span>}
                  {supportOnly && email && <span>{email}</span>}
                  {supportOnly && phone && <span>{phone}</span>}
                </Stack>
              </Col>
              <Col xs="auto" />
            </Row>
            <Row>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Col xs={12}>
                  {!supportOnly && staff.options.length ? (
                    <Form.Group as={Row} className="mb-1">
                      <Form.Label column xs="auto">
                        {translate('Staff')}:
                      </Form.Label>
                      <Col>
                        <SymbolsGroup
                          items={staff.options}
                          max={6}
                          length={staff.totalItems}
                          onClick={() => goToUsers(true)}
                        />
                      </Col>
                    </Form.Group>
                  ) : null}
                  {supports.options.length ? (
                    <Form.Group as={Row} className="mb-1">
                      <Form.Label column xs="auto">
                        {translate('Support')}:
                      </Form.Label>
                      <Col>
                        <SymbolsGroup
                          items={supports.options}
                          max={6}
                          length={supports.totalItems}
                          onClick={() => goToUsers(false, true)}
                        />
                      </Col>
                    </Form.Group>
                  ) : null}
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
