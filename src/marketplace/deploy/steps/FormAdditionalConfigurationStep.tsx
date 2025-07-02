import classNames from 'classnames';
import { useSelector } from 'react-redux';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { Tip } from '@waldur/core/Tooltip';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';

import { orderCustomerSelector } from '../selectors';
import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => {
  const customer = useSelector(orderCustomerSelector);
  return (
    <Tip id={`tip-${props.id}`} label={props.disabledTooltip}>
      <AccordionCard
        title={props.title}
        id={props.id}
        className={classNames('step-card', props.disabled && 'step-disabled')}
        defaultOpen
      >
        {props.disabled && <div className="step-blocker" />}
        <OptionsForm options={props.offering.options} customer={customer} />
      </AccordionCard>
    </Tip>
  );
};
