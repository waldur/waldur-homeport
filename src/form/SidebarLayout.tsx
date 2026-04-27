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
      className={
        isVMode
          ? classNames(
              'v-stepper-form-sidebar',
              props.hideOnVertical && 'd-none',
            )
          : 'v-stepper-form-sidebar drawer drawer-end drawer-on'
      }
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
      className={
        isVMode
          ? classNames(
              'v-stepper-form-sidebar transparent',
              props.hideOnVertical && 'd-none',
            )
          : 'v-stepper-form-sidebar transparent drawer drawer-end drawer-on'
      }
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
