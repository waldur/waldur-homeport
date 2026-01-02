import { CaretDownIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, PropsWithChildren, ReactNode, useContext } from 'react';
import {
  Accordion,
  AccordionContext,
  Card,
  useAccordionButton,
} from 'react-bootstrap';

interface AccordionCardProps extends PropsWithChildren {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  id?: string;
  className?: string;
  titleClassName?: string;
  defaultOpen?: boolean;
  /** Controlled open state - when provided, component becomes controlled */
  isOpen?: boolean;
  /** Callback when accordion is toggled - required for controlled mode */
  onToggle?: (isOpen: boolean) => void;
  solid?: boolean;
  size?: 'sm';
  secondary?: boolean;
}

const CustomToggle = ({
  eventKey,
  title,
  subtitle,
  titleClassName,
  actions,
}) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);

  const isOpen = activeEventKey === eventKey;

  return (
    <Card.Header
      role="button"
      className={!isOpen && 'border-0'}
      onClick={decoratedOnClick}
    >
      <div>
        <h4 className={classNames('mb-0', titleClassName)}>{title}</h4>
        {subtitle && (
          <small className="fs-6 fw-normal d-block mt-2 text-muted">
            {subtitle}
          </small>
        )}
      </div>
      <div className={'card-toolbar gap-4' + (isOpen ? ' active' : '')}>
        {Boolean(actions) && (
          <div
            onClick={(e) => e.stopPropagation()}
            aria-hidden="true"
            className="d-flex gap-4"
          >
            {actions}
          </div>
        )}
        <CaretDownIcon weight="bold" size={20} className="rotate-180" />
      </div>
    </Card.Header>
  );
};

export const AccordionCard: FC<AccordionCardProps> = (props) => {
  // Determine if controlled mode based on isOpen prop
  const isControlled = props.isOpen !== undefined;

  // For controlled mode, use activeKey; for uncontrolled, use defaultActiveKey
  const accordionProps = isControlled
    ? {
        activeKey: props.isOpen ? '0' : null,
        onSelect: (eventKey: string | null) => {
          props.onToggle?.(eventKey === '0');
        },
      }
    : {
        defaultActiveKey: props.defaultOpen ? '0' : undefined,
      };

  return (
    <Accordion
      {...accordionProps}
      className={props.secondary ? 'accordion-secondary' : undefined}
    >
      <Card
        className={classNames(
          'card-bordered',
          props.solid && 'card-solid',
          props.size && 'card-' + props.size,
          props.className,
        )}
        id={props.id}
      >
        <CustomToggle
          eventKey="0"
          title={props.title}
          subtitle={props.subtitle}
          titleClassName={classNames(
            props.titleClassName,
            props.secondary && 'text-secondary fs-6',
          )}
          actions={props.actions}
        />

        <Accordion.Collapse eventKey="0">
          <Card.Body>{props.children}</Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};
