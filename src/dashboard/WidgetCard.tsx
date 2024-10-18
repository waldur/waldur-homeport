import { DotsThreeOutlineVertical } from '@phosphor-icons/react';
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
  className?: string;
  right?: ReactNode;
}

export const WidgetCard: FC<PropsWithChildren<WidgetCardProps>> = ({
  cardTitle,
  title,
  meta,
  actions,
  className,
  children,
  right,
}) => {
  return (
    <Card className={className}>
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-center mb-4">
          <Card.Title as="div" className="fw-bold flex-grow-1 h4 mb-0">
            {cardTitle}
          </Card.Title>
          {actions?.length && (
            <Dropdown>
              <Dropdown.Toggle
                variant="active-light-primary"
                size="sm"
                bsPrefix="btn-icon"
              >
                <DotsThreeOutlineVertical
                  size={20}
                  weight="fill"
                  className="text-muted"
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
        <Row className="align-items-end justify-content-between mt-auto gap-4">
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
          {right}
        </Row>
        {children}
      </Card.Body>
    </Card>
  );
};
