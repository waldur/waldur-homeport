import { FC, PropsWithChildren } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { PublicInvitation } from 'waldur-js-client';

import { formatDate, formatDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';

const DetailRow: FC<PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => (
  <div className="d-flex gap-4">
    <div className="fw-semibold min-w-125px">{label}</div>
    <div className="text-muted">{children}</div>
  </div>
);

export const InvitationDetailsCard: FC<{ invitation: PublicInvitation }> = ({
  invitation,
}) => (
  <Card className="card-bordered mb-6">
    <Card.Header>
      <Card.Title>
        <h3>{translate('Invitation details')}</h3>
      </Card.Title>
    </Card.Header>
    <Card.Body>
      <Row className="gy-3">
        <Col md={6} className="d-flex flex-column gap-3">
          <DetailRow label={translate('Call name:')}>
            {invitation.call_name}
          </DetailRow>
          {invitation.invited_by_name && (
            <DetailRow label={translate('Invited by:')}>
              {invitation.invited_by_name}
            </DetailRow>
          )}
          {invitation.max_assignments != null && (
            <DetailRow label={translate('Max. proposals:')}>
              {invitation.max_assignments}
            </DetailRow>
          )}
        </Col>
        <Col md={6} className="d-flex flex-column gap-3">
          {invitation.invited_at && (
            <DetailRow label={translate('Invited on:')}>
              {formatDateTime(invitation.invited_at)}
            </DetailRow>
          )}
          {invitation.expires_at && (
            <DetailRow label={translate('Respond by:')}>
              {formatDate(invitation.expires_at)} ·{' '}
              {formatRelative(invitation.expires_at)}
            </DetailRow>
          )}
        </Col>
      </Row>
    </Card.Body>
  </Card>
);
