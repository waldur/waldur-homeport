import classNames from 'classnames';

import { Tooltip } from 'waldur-ui';

import { AccordionCard } from '@/core/AccordionCard';
import { OptionsForm } from '@/marketplace/common/OptionsForm';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormAdditionalConfigurationStep = (props: FormStepProps) => {
  const { customer } = useOrderFormData();

  return (
    <Tooltip label={props.disabledTooltip}>
      <span>
        <AccordionCard
          title={props.title}
          id={props.id}
          className={classNames('step-card', props.disabled && 'step-disabled')}
          defaultOpen
        >
          {props.disabled && <div className="step-blocker" />}
          <OptionsForm options={props.offering.options} customer={customer} />
        </AccordionCard>
      </span>
    </Tooltip>
  );
};
