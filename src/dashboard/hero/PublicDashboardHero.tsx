import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { DashboardHeroLogo } from './DashboardHeroLogo';
import './PublicDashboardHero.scss';

interface PublicDashboardHeroProps {
  asHero?: boolean;
  backgroundImage?: string;
  logo: string;
  logoAlt?: string;
  logoTopLabel?: string | ReactNode;
  logoBottomLabel?: string | ReactNode;
  logoTopClass?: string;
  logoBottomClass?: string;
  title: ReactNode;
  actions?: ReactNode;
  quickActions?: ReactNode;
  quickBody?: ReactNode;
  quickFooter?: ReactNode;
  quickFooterClassName?: string;
  className?: string;
}

export const PublicDashboardHero: FC<
  PropsWithChildren<PublicDashboardHeroProps>
> = (props) => {
  const body = (
    <Row className={classNames('public-dashboard-hero-body', props.className)}>
      <Col md={8} sm={12} className="d-flex">
        <Card className="w-100 mb-md-0 mb-4">
          <Card.Body className="d-flex flex-column flex-sm-row align-items-stretch gap-10 flex-grow-1">
            <DashboardHeroLogo
              logo={props.logo}
              logoAlt={props.logoAlt}
              logoTopLabel={props.logoTopLabel}
              logoBottomLabel={props.logoBottomLabel}
              logoTopClass={props.logoTopClass}
              logoBottomClass={props.logoBottomClass}
            />
            <div className="d-flex flex-column flex-grow-1">
              <div className="d-flex flex-grow-1 flex-sm-row flex-column-reverse">
                {/* Title */}
                <div className="flex-grow-1">{props.title}</div>
                {/* Actions */}
                <div className="d-flex align-self-end align-self-sm-start">
                  {props.actions}
                </div>
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
          <Card.Body className="d-flex flex-column pb-4">
            {props.quickActions && (
              <div className="mb-5">{props.quickActions}</div>
            )}
            {props.quickBody && <div>{props.quickBody}</div>}
            {props.quickFooter && (
              <div
                className={classNames(
                  'flex-grow-1 d-flex align-items-end',
                  props.quickFooterClassName,
                )}
              >
                {props.quickFooter}
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  return props.asHero ? (
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
          <div className="container-xxl py-16">{body}</div>
        </div>
      </div>
    </div>
  ) : (
    body
  );
};
