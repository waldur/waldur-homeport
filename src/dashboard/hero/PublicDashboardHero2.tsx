import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

import { DashboardHeroLogo2 } from './DashboardHeroLogo2';

interface PublicDashboardHero2Props {
  backgroundImage?: string;
  logo: string;
  logoAlt?: string;
  logoSize?: number;
  logoCircle?: boolean;
  logoTooltip?: string;
  title: ReactNode;
  actions?: ReactNode;
  quickActions?: ReactNode;
  quickBody?: ReactNode;
  quickFooter?: ReactNode;
  quickFooterClassName?: string;
  className?: string;
  hideQuickSection?: boolean;
  cardBordered?: boolean;
}

export const PublicDashboardHero2: FC<
  PropsWithChildren<PublicDashboardHero2Props>
> = (props) => {
  return (
    <div className="public-dashboard-hero">
      <Row
        className={classNames('public-dashboard-hero-body', props.className)}
      >
        <Col
          md={props.hideQuickSection ? undefined : 6}
          sm={props.hideQuickSection ? undefined : 12}
          className="d-flex"
        >
          <Card
            className={classNames(
              'w-100 mb-md-0 mb-4',
              props.cardBordered && 'card-bordered',
            )}
          >
            <Card.Body className="d-flex flex-column flex-sm-row align-items-stretch gap-10 flex-grow-1 p-6">
              <Tip
                label={props.logoTooltip}
                id={`tip-header-${props.logoTooltip}`}
              >
                <DashboardHeroLogo2
                  logo={props.logo}
                  logoAlt={props.logoAlt}
                  circle={props.logoCircle}
                  size={props.logoSize || 50}
                />
              </Tip>
              <div className="d-flex flex-column flex-grow-1">
                <div className="d-flex flex-sm-row flex-column-reverse">
                  {/* Title */}
                  <div className="flex-grow-1">{props.title}</div>
                  {/* Actions */}
                  {props.actions && (
                    <div className="d-flex align-self-end align-self-sm-start gap-3">
                      {props.actions}
                    </div>
                  )}
                </div>
                <div>
                  {/* Details */}
                  {props.children}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {!props.hideQuickSection && (
          <Col md={6} sm={12} className="d-flex">
            <Card className="flex-grow-1">
              <Card.Body className="d-flex flex-column p-6 pb-2">
                <Row>
                  <Col xs>{props.quickBody}</Col>
                  {/* Quick actions */}
                  {props.quickActions && (
                    <Col xs="auto">{props.quickActions}</Col>
                  )}
                </Row>
                {props.quickFooter && (
                  <div
                    className={classNames(
                      'flex-grow-1 d-flex align-items-end',
                      props.quickFooterClassName,
                      'mt-5',
                    )}
                  >
                    {props.quickFooter}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};
