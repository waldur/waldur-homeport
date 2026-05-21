import classNames from 'classnames';

import { AccordionCard } from '@/core/AccordionCard';
import { Tip } from '@/core/Tooltip';
import { OptionsForm } from '@/marketplace/common/OptionsForm';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => {
  const { customer } = useOrderFormData();

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
