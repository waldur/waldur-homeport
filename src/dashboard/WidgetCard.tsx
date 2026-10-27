import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { BaseButton, Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { ActionsMenu } from '@/table/ActionsDropdown';

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
      <Card.Body className="flex">
        {left && <div className="me-4 shrink-0">{left}</div>}
        <div className="flex flex-col grow">
          <div
            className={classNames('flex items-center gap-3 ', actions?.length)}
          >
            <Card.Title as="div" className="font-medium grow h4 mb-0">
              {cardTitle}
            </Card.Title>
            {cardAction && <div className="p-0 m-0 shrink-0">{cardAction}</div>}
            {actions?.length > 0 && (
              <ActionsMenu
                side="bottom"
                align="center"
                toggle={
                  <BaseButton
                    variant="text-secondary"
                    size="sm"
                    tooltip={translate('More actions')}
                    iconNode={
                      <DotsThreeVerticalIcon
                        size={20}
                        weight="bold"
                        className="text-quinary"
                      />
                    }
                  />
                }
              >
                {actions.map((action, index) => (
                  <Menu.Item
                    key={index}
                    icon={action.icon}
                    onSelect={action.callback}
                  >
                    {action.label}
                  </Menu.Item>
                ))}
              </ActionsMenu>
            )}
          </div>
          {(title || meta || right) && (
            <Row className="items-end justify-between mt-auto gap-4 g-2">
              {(title || meta) && (
                <Col>
                  <Row className="items-center gap-4 mb-2">
                    <h1 className="mb-0 text-nowrap text-2xl col col-sm-12 col-md col-xxl-12">
                      {title}
                    </h1>
                    {meta && (
                      <Col
                        xs="auto"
                        className="text-secondary text-nowrap text-sm"
                      >
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
