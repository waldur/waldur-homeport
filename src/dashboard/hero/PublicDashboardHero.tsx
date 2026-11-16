import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';

import { Tooltip, Card, CardContent } from 'waldur-ui';

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
  return (
    <div
      className={classNames('public-dashboard-hero', props.containerClassName)}
      data-testid="dashboard-hero"
    >
      <div
        className={classNames(
          'public-dashboard-hero-body',
          !props.hideQuickSection &&
            'grid grid-cols-1 page-md:grid-cols-2 gap-x-5',
          props.className,
        )}
      >
        <div className="flex">
          <Card
            bordered={props.cardBordered}
            className="w-full page-md:mb-0 mb-3"
          >
            {props.backgroundImage && (
              <img
                alt=""
                className="w-full rounded-t-[7px] object-cover h-40"
                src={props.backgroundImage}
              />
            )}
            <CardContent className="flex flex-col page-sm:flex-row items-stretch grow">
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
                <div className="flex page-sm:flex-row flex-col-reverse page-sm:items-center gap-2.5">
                  {/* Title */}
                  <div className="grow min-w-0">{props.title}</div>
                  {/* Actions */}
                  {props.actions && (
                    <div
                      className={classNames(
                        props.mobileBottomActions
                          ? 'hidden page-sm:flex'
                          : 'flex',
                        'public-dashboard-hero-actions shrink-0 flex-wrap self-stretch page-sm:self-start page-sm:justify-end gap-2.5',
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
                  <div className="page-sm:hidden flex flex-wrap self-stretch page-sm:self-start page-sm:justify-end gap-2.5">
                    {props.actions}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {!props.hideQuickSection && (
          <div className="flex">
            <Card bordered={props.cardBordered} className="grow">
              <CardContent className="flex flex-col">
                <div className="flex flex-wrap gap-x-5 gap-y-3">
                  {/* At least 256px, or the whole row on a narrower card:
                      below it the quick actions wrap under the body rather
                      than the body -- a table, say, that cannot shrink past
                      its content -- running under them. */}
                  <div className="flex-1 min-w-[min(256px,100%)]">
                    {props.quickBody}
                  </div>
                  {/* Quick actions */}
                  {props.quickActions && (
                    <div className="flex-none">{props.quickActions}</div>
                  )}
                </div>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
