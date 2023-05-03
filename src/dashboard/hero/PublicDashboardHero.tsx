import { FC, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogoMetronic';
import { Logo } from '@waldur/marketplace/offerings/service-providers/shared/Logo';

import './PublicDashboardHero.scss';

interface PublicDashboardHeroProps {
  backgroundImage?: string;
  logo: string;
  logoAlt?: string;
  smallLogo?: string;
  title: ReactNode;
  actions?: ReactNode;
  quickActions?: ReactNode;
  quickBody?: ReactNode;
  quickFooter?: ReactNode;
}

export const PublicDashboardHero: FC<PublicDashboardHeroProps> = (props) => {
  return (
    <div
      className="public-dashboard-hero__background"
      style={
        props.backgroundImage
          ? { backgroundImage: `url(${props.backgroundImage})` }
          : {}
      }
    >
      <div className="public-dashboard-hero__table">
        <div className="public-dashboard-hero__cell">
          <div className="container-xxl py-16">
            <Row>
              <Col md={8} sm={12}>
                <Card className="w-100">
                  <Card.Body className="d-flex gap-10 flex-grow-1">
                    <div
                      className="public-dashboard-logo d-flex align-items-center justify-content-center"
                      style={{ width: 150 }}
                    >
                      <OfferingLogo
                        src={props.smallLogo}
                        size={50}
                        className="dashboard-small-logo"
                      />
                      <Logo
                        image={props.logo}
                        placeholder={props.logoAlt[0]}
                        height={100}
                        width={100}
                      />
                      <span className="dashboard-small-label top-label bg-secondary">
                        {translate('Draft')}
                      </span>
                      <span className="dashboard-small-label bottom-label bg-secondary">
                        {translate('Offering')}
                      </span>
                    </div>
                    <div className="d-flex flex-column flex-grow-1">
                      <div className="d-flex flex-grow-1">
                        {/* Title */}
                        <div className="flex-grow-1">{props.title}</div>
                        {/* Actions */}
                        {props.actions}
                      </div>
                      <div className="mt-6">
                        {/* Details */}
                        {props.children}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              {/* Quick view */}
              <Col md={4} sm={12} className="d-flex">
                <Card className="flex-grow-1">
                  <Card.Body className="d-flex flex-column">
                    {props.quickActions && (
                      <div className="mb-5">{props.quickActions}</div>
                    )}
                    {props.quickBody && (
                      <div className="mb-5">{props.quickBody}</div>
                    )}
                    {props.quickFooter && (
                      <div className="flex-grow-1">{props.quickFooter}</div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};
