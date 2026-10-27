import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import { DashboardHeroLogo2 } from './DashboardHeroLogo2';

import './PublicDashboardHero.scss';

interface PublicDashboardHeroProps {
  backgroundImage?: string;
  logo?: string;
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

export const PublicDashboardHero: FC<
  PropsWithChildren<PublicDashboardHeroProps>
> = (props) => {
  const BodyElement = props.hideQuickSection ? 'div' : Row;
  return (
    <div
      className={classNames('public-dashboard-hero', props.containerClassName)}
    >
      <BodyElement
        className={classNames('public-dashboard-hero-body', props.className)}
      >
        <Col
          md={props.hideQuickSection ? undefined : 6}
          sm={props.hideQuickSection ? undefined : 12}
          className="flex"
        >
          <Card
            className={classNames(
              'w-full md:mb-0 mb-3',
              props.cardBordered && 'card-bordered',
            )}
          >
            {props.backgroundImage && (
              <Card.Img
                variant="top"
                src={props.backgroundImage}
                style={{ height: 160, objectFit: 'cover' }}
              />
            )}
            <Card.Body className="flex flex-col sm:flex-row items-stretch grow">
              {props.logo || props.logoAlt ? (
                <Tooltip label={props.logoTooltip}>
                  <span>
                    <DashboardHeroLogo2
                      logo={props.logo}
                      logoAlt={props.logoAlt}
                      circle={props.logoCircle}
                      size={props.logoSize || 48}
                    />
                  </span>
                </Tooltip>
              ) : null}
              {/* min-w-0: a flex item won't shrink below its longest word, so an
                  unbroken name would push the details out of the card */}
              <div className="flex flex-col grow gap-1.5 min-w-0">
                <div className="flex sm:flex-row flex-col-reverse sm:items-center gap-2.5">
                  {/* Title */}
                  <div className="grow min-w-0">{props.title}</div>
                  {/* Actions */}
                  {props.actions && (
                    <div
                      className={classNames(
                        props.mobileBottomActions ? 'hidden sm:flex' : 'flex',
                        'public-dashboard-hero-actions shrink-0 flex-wrap self-stretch sm:self-start sm:justify-end gap-2.5',
                      )}
                    >
                      {props.actions}
                    </div>
                  )}
                </div>
                {props.children && (
                  <div>
                    {/* Details */}
                    {props.children}
                  </div>
                )}
                {/* Actions - at the end */}
                {props.actions && props.mobileBottomActions && (
                  <div className="sm:hidden flex flex-wrap self-stretch sm:self-start sm:justify-end gap-2.5">
                    {props.actions}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {!props.hideQuickSection && (
          <Col md={6} sm={12} className="flex">
            <Card
              className={classNames(
                'grow',
                props.cardBordered && 'card-bordered',
              )}
            >
              <Card.Body className="flex flex-col">
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
                      'grow flex items-end',
                      props.quickFooterClassName,
                      'mt-4',
                    )}
                  >
                    {props.quickFooter}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        )}
      </BodyElement>
    </div>
  );
};
