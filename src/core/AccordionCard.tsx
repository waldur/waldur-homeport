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
  id?: string;
  className?: string;
  titleClassName?: string;
  defaultOpen?: boolean;
  solid?: boolean;
}

const CustomToggle = ({ eventKey, title, titleClassName }) => {
  const { activeEventKey } = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey);

  const isOpen = activeEventKey === eventKey;

  return (
    <Card.Header
      role="button"
      className={!isOpen && 'border-0'}
      onClick={decoratedOnClick}
    >
      <h4 className={classNames('mb-0', titleClassName)}>{title}</h4>
      <div className={'card-toolbar' + (isOpen ? ' active' : '')}>
        <CaretDownIcon weight="bold" size={20} className="rotate-180" />
      </div>
    </Card.Header>
  );
};

export const AccordionCard: FC<AccordionCardProps> = (props) => {
  return (
    <Accordion defaultActiveKey={props.defaultOpen && '0'}>
      <Card
        className={classNames(
          'card-bordered',
          props.solid && 'card-solid',
          props.className,
        )}
        id={props.id}
      >
        <CustomToggle
          eventKey="0"
          title={props.title}
          titleClassName={props.titleClassName}
        />

        <Accordion.Collapse eventKey="0">
          <Card.Body>{props.children}</Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};
