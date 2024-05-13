import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

import { DashboardHeroLogo2 } from './DashboardHeroLogo2';

interface PublicDashboardHero2Props {
  backgroundImage?: string;
  logo: string;
  logoAlt?: string;
  logoCircle?: boolean;
  logoTooltip?: string;
  title: ReactNode;
  actions?: ReactNode;
  quickActions?: ReactNode;
  quickBody?: ReactNode;
  quickFooter?: ReactNode;
  quickFooterClassName?: string;
  className?: string;
}

export const PublicDashboardHero2: FC<
  PropsWithChildren<PublicDashboardHero2Props>
> = (props) => {
  return (
    <div className="public-dashboard-hero container-xxl mt-6 mb-8">
      <Row
        className={classNames('public-dashboard-hero-body', props.className)}
      >
        <Col md={6} sm={12} className="d-flex">
          <Card className="w-100 mb-md-0 mb-4">
            <Card.Body className="d-flex flex-column flex-sm-row align-items-stretch gap-10 flex-grow-1 py-6">
              <Tip
                label={props.logoTooltip}
                id={`tip-header-${props.logoTooltip}`}
              >
                <DashboardHeroLogo2
                  logo={props.logo}
                  logoAlt={props.logoAlt}
                  circle={props.logoCircle}
                  size={50}
                />
              </Tip>
              <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex flex-grow-1 flex-sm-row flex-column-reverse">
                  {/* Title */}
                  <div className="flex-grow-1">{props.title}</div>
                </div>
                <div className="mt-6">
                  {/* Details */}
                  {props.children}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} sm={12} className="d-flex">
          <Card className="flex-grow-1">
            <Card.Body className="d-flex flex-column py-6">
              <Row className="mb-5">
                <Col xs>{props.quickBody}</Col>
                {/* Actions */}
                {(props.actions || props.quickActions) && (
                  <Col xs="auto">
                    {props.quickActions && (
                      <div className="mb-2">{props.quickActions}</div>
                    )}
                    {props.actions && (
                      <div className="d-flex flex-column align-items-end">
                        {props.actions}
                      </div>
                    )}
                  </Col>
                )}
              </Row>
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
    </div>
  );
};