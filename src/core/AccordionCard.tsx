import { CaretDownIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  FC,
  KeyboardEvent,
  PropsWithChildren,
  ReactNode,
  useContext,
} from 'react';
import {
  Accordion,
  AccordionContext,
  Card,
  useAccordionButton,
} from 'react-bootstrap';

import { translate } from '@/i18n';

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

  // The title is the control, not the whole header. A header that is itself
  // role=button cannot legally contain the buttons `actions` place inside it,
  // and hiding those from assistive technology — as this once did — left them
  // focusable but unnamed. The title grows to fill the strip up to the
  // toolbar, so the clickable area is the same as before.
  const onTitleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      decoratedOnClick(event);
    }
  };

  return (
    <Card.Header className={!isOpen && 'border-0'}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        className="flex-grow-1"
        onClick={decoratedOnClick}
        onKeyDown={onTitleKeyDown}
      >
        <h4 className={classNames('mb-0', titleClassName)}>{title}</h4>
        {subtitle && (
          <small className="fs-6 fw-normal d-block mt-2 text-muted">
            {subtitle}
          </small>
        )}
      </div>
      <div className={'card-toolbar gap-4' + (isOpen ? ' active' : '')}>
        {Boolean(actions) && <div className="d-flex gap-4">{actions}</div>}
        <button
          type="button"
          // Bare on purpose: a tooltip on every caret in the app would be
          // noise. `.active > .rotate-180` turns the caret, so the class rides
          // on the element that now holds it.
          className={classNames(
            'border-0 bg-transparent p-0 d-flex',
            isOpen && 'active',
          )}
          aria-label={translate('Toggle')}
          aria-expanded={isOpen}
          onClick={decoratedOnClick}
        >
          <CaretDownIcon weight="bold" size={20} className="rotate-180" />
        </button>
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
