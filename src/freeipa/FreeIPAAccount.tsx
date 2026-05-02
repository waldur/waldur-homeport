import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useAsyncFn, useEffectOnce } from 'react-use';
import { freeipaProfilesList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { FreeIPAAccountCreate } from './FreeIPAAccountCreate';
import { FreeIPAAccountEdit } from './FreeIPAAccountEdit';
import { SyncProfile } from './SyncProfile';

export const FreeIpaAccount = () => {
  const user = useUser();
  const { showError } = useNotify();

  if (!ENV.plugins.WALDUR_CORE.FREEIPA_ENABLED) {
    showError(translate('FreeIPA extension is disabled.'));
    router.stateService.go('errorPage.notFound');
  }

  const [{ loading: isLoading, error, value: profile }, refreshProfile] =
    useAsyncFn(
      () =>
        freeipaProfilesList({ query: { user: user.uuid } }).then(
          (r) => r.data[0],
        ),
      [user.uuid],
    );

  useEffectOnce(() => {
    refreshProfile();
  });
  const [loading, setLoading] = React.useState<boolean>();

  if (isLoading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load data.')}</>;

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Row className="card-toolbar g-0 gap-4 w-100">
          <Col xs className="order-0 mw-sm-25">
            <Card.Title>
              <span className="h3 me-2">{translate('FreeIPA account')}</span>
            </Card.Title>
          </Col>
          {profile && (
            <Col sm="auto" className="order-1 order-sm-2 min-w-25 ms-auto">
              <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3">
                <SyncProfile
                  profile={profile}
                  setLoading={setLoading}
                  refreshProfile={refreshProfile}
                />
              </div>
            </Col>
          )}
        </Row>
      </Card.Header>
      <Card.Body>
        {profile ? (
          <FreeIPAAccountEdit profile={profile} loading={loading} />
        ) : (
          <FreeIPAAccountCreate onProfileAdded={refreshProfile} />
        )}
      </Card.Body>
    </Card>
  );
};
