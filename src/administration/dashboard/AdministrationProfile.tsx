import { useQuery } from '@tanstack/react-query';
import { Card, Col, Form, Row, Stack } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { fixURL } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SymbolsGroup } from '@waldur/customer/dashboard/SymbolsGroup';
import { DashboardHeroLogo } from '@waldur/dashboard/hero/DashboardHeroLogo';
import { translate } from '@waldur/i18n';
import { getUsers } from '@waldur/marketplace/common/api';

import { getVersion } from '../api';

interface AdministrationProfileProps {
  healthy: boolean;
}

export const AdministrationProfile = ({
  healthy,
}: AdministrationProfileProps) => {
  const image = fixURL('/icons/login_logo/');
  const website = ENV.plugins.WALDUR_CORE.HOMEPORT_URL;

  const { data: version } = useQuery(['version'], () => getVersion(), {
    staleTime: Infinity,
  });

  const { value, loading } = useAsync(() => {
    const promises = [
      getUsers({ page: 1, page_size: 6, is_staff: true }),
      getUsers({ page: 1, page_size: 6, is_support: true }),
    ];
    return Promise.all(promises);
  });

  const [staff, supports] = value || [];

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto">
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
            <Row className="mb-6">
              <Col>
                <h2>{ENV.plugins.WALDUR_CORE.SITE_NAME}</h2>
                <Stack direction="horizontal" className="gap-6 text-muted">
                  {version?.version && (
                    <span>
                      {translate('Version')}&nbsp;{version.version}
                    </span>
                  )}
                  {website && <span>{website}</span>}
                </Stack>
              </Col>
              <Col xs="auto"></Col>
            </Row>
            <Row>
              {loading ? (
                <LoadingSpinner />
              ) : (
                <Col xs={12}>
                  {staff.options.length && (
                    <Form.Group as={Row} className="mb-1">
                      <Form.Label column xs="auto">
                        {translate('Staff')}:
                      </Form.Label>
                      <Col>
                        <SymbolsGroup
                          items={staff.options}
                          max={6}
                          length={staff.totalItems}
                        />
                      </Col>
                    </Form.Group>
                  )}
                  {supports.options.length && (
                    <Form.Group as={Row} className="mb-1">
                      <Form.Label column xs="auto">
                        {translate('Support')}:
                      </Form.Label>
                      <Col>
                        <SymbolsGroup
                          items={supports.options}
                          max={6}
                          length={supports.totalItems}
                        />
                      </Col>
                    </Form.Group>
                  )}
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
