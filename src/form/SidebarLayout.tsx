import classNames from 'classnames';
import { FC, PropsWithChildren } from 'react';
import { Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { useFullPage } from '@/navigation/context';

import './SidebarLayout.scss';

const Container: FC<PropsWithChildren> = (props) => (
  <div className="v-stepper-form container-xxl d-flex flex-column flex-xl-row gap-5 pb-10">
    {props.children}
  </div>
);

const Body: FC<PropsWithChildren<{ className? }>> = (props) => (
  <div
    className={classNames(
      'd-flex flex-column flex-lg-row-fluid gap-5',
      props.className,
    )}
  >
    {props.children}
  </div>
);

// Sticks below the fixed header, page tabs and impersonation bar
// (--layout-sticky-top, see layout/_sticky-top.scss).
const stickyClassName = classNames(
  'sticky z-95',
  'h-[calc(100vh-var(--layout-sticky-top)-10px)]',
);

const cardClassName = classNames(
  stickyClassName,
  'top-(--layout-sticky-top)',
  'in-[.toolbar-fixed]:h-[calc(100vh-var(--layout-sticky-top))]',
);

const transparentClassName = classNames(
  stickyClassName,
  'top-[calc(var(--layout-sticky-top)+10px)]',
  'in-[.toolbar-fixed]:top-[calc(var(--layout-sticky-top)+20px)]',
  'in-[.toolbar-fixed]:h-fit',
);

const Sidebar: FC<
  PropsWithChildren<{
    title?: string;
    transparent?: boolean;
    hideOnVertical?: boolean;
  }>
> = (props) => {
  const isVMode = useMediaQuery({ maxWidth: 1200 });
  useFullPage();

  return !props.transparent ? (
    <div
      className={classNames(
        'v-stepper-form-sidebar',
        cardClassName,
        isVMode
          ? props.hideOnVertical && 'd-none'
          : 'drawer drawer-end drawer-on',
      )}
    >
      <Card className="card-bordered w-100">
        {props.title ? (
          <Card.Header>
            <div className="me-2">
              <h4 className="mb-0">{props.title}</h4>
            </div>
          </Card.Header>
        ) : null}
        <Card.Body>{props.children}</Card.Body>
      </Card>
    </div>
  ) : (
    <div
      className={classNames(
        'v-stepper-form-sidebar transparent',
        transparentClassName,
        isVMode
          ? props.hideOnVertical && 'd-none'
          : 'drawer drawer-end drawer-on',
      )}
    >
      <div className="w-100">
        {props.title ? <h4>{props.title}</h4> : null}
        {props.children}
      </div>
    </div>
  );
};

const Header: FC<PropsWithChildren<{ className?: string }>> = (props) => (
  <div
    className={classNames(
      'container-xxl v-stepper-form-header',
      props.className,
    )}
  >
    {props.children}
  </div>
);

export const SidebarLayout = { Container, Header, Body, Sidebar };
