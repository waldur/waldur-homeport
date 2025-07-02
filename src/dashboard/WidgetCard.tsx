import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Dropdown, Row } from 'react-bootstrap';

interface WidgetCardAction {
  label: string;
  icon: ReactNode;
  callback();
}

interface WidgetCardProps {
  cardTitle: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  actions?: WidgetCardAction[];
  cardAction?: ReactNode;
  className?: string;
  right?: ReactNode;
  left?: ReactNode;
  cardBordered?: boolean;
}

export const WidgetCard: FC<PropsWithChildren<WidgetCardProps>> = ({
  cardTitle,
  title,
  meta,
  actions,
  cardAction,
  className,
  children,
  right,
  left,
  cardBordered = true,
}) => {
  return (
    <Card
      className={classNames(
        'card-widget',
        cardBordered && 'card-bordered',
        className,
      )}
    >
      <Card.Body className="d-flex">
        {left && <div className="me-4 flex-shrink-0">{left}</div>}
        <div className="d-flex flex-column flex-grow-1">
          <div
            className={
              'd-flex align-items-center gap-3 ' +
              (actions?.length ? 'mb-1' : 'mb-2')
            }
          >
            <Card.Title as="div" className="fw-bold flex-grow-1 h4 mb-0">
              {cardTitle}
            </Card.Title>
            {cardAction && (
              <div className="p-0 m-0 flex-shrink-0">{cardAction}</div>
            )}
            {actions?.length && (
              <Dropdown>
                <Dropdown.Toggle
                  variant="active-light-primary"
                  size="sm"
                  bsPrefix="btn-icon"
                  className="h-25px w-25px"
                >
                  <DotsThreeVerticalIcon
                    size={20}
                    weight="bold"
                    className="text-gray-400"
                  />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {actions.map((action, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={action.callback}
                      role="menuitem"
                      tabIndex={-1}
                    >
                      <span className="svg-icon">{action.icon}</span>
                      {action.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
          {(title || meta || right) && (
            <Row className="align-items-end justify-content-between mt-auto gap-4 g-2">
              {(title || meta) && (
                <Col>
                  <Row className="align-items-center gap-4 mb-2">
                    <h1 className="mb-0 text-nowrap fs-1x col col-sm-12 col-md col-xxl-12">
                      {title}
                    </h1>
                    {meta && (
                      <Col xs="auto" className="text-gray-700 text-nowrap fs-6">
                        {meta}
                      </Col>
                    )}
                  </Row>
                </Col>
              )}
              {right}
            </Row>
          )}
          {children}
        </div>
      </Card.Body>
    </Card>
  );
};
