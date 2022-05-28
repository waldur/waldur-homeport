import { useMemo } from 'react';
import { Card, Col, ProgressBar, Row, Stack } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

import { HexagonShape } from './HexagonShape';
import { calculateProfileCompletionPercentage } from './utils';

export const UserWelcome = ({ user }: { user: UserDetails }) => {
  const profileCompletionPercentage = useMemo(
    () => calculateProfileCompletionPercentage(user),
    [user],
  );

  return (
    <Card className="mb-6">
      <Card.Body>
        <Row>
          <Col xs="auto" className="order-1 order-sm-0 px-5">
            <HexagonShape />
          </Col>
          <Col className="order-2 order-sm-1">
            <h2>{translate('Welcome, {user}!', { user: user.first_name })}</h2>
            <p>
              {translate(
                'Thanks for signing up. In order to help you make the most out of the platform, please complete your profile by pressing "{link}" and fill out the blank fields.',
                {
                  link: (
                    <Link
                      label={translate('Edit profile')}
                      state="profile.manage"
                      className="text-capitalize"
                    />
                  ),
                },
                formatJsxTemplate,
              )}
            </p>
          </Col>
          <Col sm md="3" className="order-0 order-sm-2 mb-10 mb-sm-0">
            <h2 className="d-none d-sm-block">&nbsp;</h2>
            <Stack direction="horizontal" gap={2} className="mb-2">
              <strong className="text-capitalize text-muted">
                {translate('Profile completion')}
              </strong>
              <strong className="ms-auto">
                {profileCompletionPercentage}%
              </strong>
            </Stack>
            <ProgressBar
              variant="success"
              now={profileCompletionPercentage}
              style={{ height: '0.5rem' }}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
