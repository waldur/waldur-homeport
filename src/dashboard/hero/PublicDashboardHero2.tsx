import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';

import { DashboardHeroLogo2 } from './DashboardHeroLogo2';
import './PublicDashboardHero2.scss';

interface PublicDashboardHero2Props {
  backgroundImage?: string;
  logo: string;
  logoAlt?: string;
  logoSize?: number;
  logoCircle?: boolean;
  logoTooltip?: string;
  title: ReactNode;
  actions?: ReactNode;
  mobileBottomActions?: boolean;
  quickActions?: ReactNode;
  quickBody?: ReactNode;
  quickFooter?: ReactNode;
  quickFooterClassName?: string;
  className?: string;
  containerClassName?: string;
  hideQuickSection?: boolean;
  cardBordered?: boolean;
}

export const PublicDashboardHero2: FC<
  PropsWithChildren<PublicDashboardHero2Props>
> = (props) => {
  return (
    <div
      className={classNames('public-dashboard-hero', props.containerClassName)}
    >
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
            <Card.Body className="d-flex flex-column flex-sm-row align-items-stretch flex-grow-1">
              <Tip
                label={props.logoTooltip}
                id={`tip-header-${props.logoTooltip}`}
              >
                <DashboardHeroLogo2
                  logo={props.logo}
                  logoAlt={props.logoAlt}
                  circle={props.logoCircle}
                  size={props.logoSize || 48}
                />
              </Tip>
              <div className="d-flex flex-column flex-grow-1 gap-3">
                <div className="d-flex flex-sm-row flex-column-reverse">
                  {/* Title */}
                  <div className="flex-grow-1">{props.title}</div>
                  {/* Actions */}
                  {props.actions && (
                    <div
                      className={
                        (props.mobileBottomActions
                          ? 'd-none d-sm-flex '
                          : 'd-flex') +
                        'flex-wrap align-self-stretch align-self-sm-start justify-content-sm-end gap-3'
                      }
                    >
                      {props.actions}
                    </div>
                  )}
                </div>
                <div>
                  {/* Details */}
                  {props.children}
                </div>
                {/* Actions - at the end */}
                {props.actions && props.mobileBottomActions && (
                  <div className="d-sm-none d-flex flex-wrap align-self-stretch align-self-sm-start justify-content-sm-end gap-3">
                    {props.actions}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {!props.hideQuickSection && (
          <Col md={6} sm={12} className="d-flex">
            <Card
              className={classNames(
                'flex-grow-1',
                props.cardBordered && 'card-bordered',
              )}
            >
              <Card.Body className="d-flex flex-column">
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
