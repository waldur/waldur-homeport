import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { useFullPage } from '@waldur/navigation/context';

import './SidebarLayout.scss';

const Container: FC = (props) => (
  <div className="v-stepper-form d-flex flex-column flex-xl-row gap-5 gap-lg-7 pb-10">
    {props.children}
  </div>
);

const Body: FC<{ className? }> = (props) => (
  <div
    className={classNames(
      'container-xxl d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7',
      props.className,
    )}
  >
    {props.children}
  </div>
);

const Sidebar: FC = (props) => {
  const isVMode = useMediaQuery({ maxWidth: 1200 });
  useFullPage();

  return (
    <div
      className={
        isVMode
          ? 'v-stepper-form-sidebar container-xxl'
          : 'v-stepper-form-sidebar drawer drawer-end drawer-on'
      }
    >
      <Card className="card-flush border-0 w-100">
        <Card.Body>{props.children}</Card.Body>
      </Card>
    </div>
  );
};

export const SidebarLayout = { Container, Body, Sidebar };