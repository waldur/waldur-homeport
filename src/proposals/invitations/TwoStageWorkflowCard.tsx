import { ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AccordionCard, Badge } from 'waldur-ui';

import { translate } from '@/i18n';

interface StepBoxProps {
  step: number;
  title: string;
  description: string;
  items: string[];
}

const StepBox: FC<StepBoxProps> = ({ step, title, description, items }) => (
  <div className="flex-fill border rounded p-4">
    <div className="d-flex align-items-center gap-2 mb-2">
      <h5 className="mb-0">{title}</h5>
      <Badge variant="success" shape="pill" tone="outline">
        {translate('Step {n}', { n: String(step) })}
      </Badge>
    </div>
    <p className="text-muted mb-3">{description}</p>
    <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
      {items.map((item) => (
        <li key={item} className="d-flex align-items-start gap-2">
          <CheckCircleIcon
            size={18}
            weight="bold"
            className="text-success flex-shrink-0"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const TwoStageWorkflowCard: FC = () => (
  <AccordionCard
    title={translate('How does the review process work?')}
    subtitle={translate(
      'The review process has two stages. Understanding these stages helps you know what to expect.',
    )}
    defaultOpen
    className="mb-6"
  >
    <div className="d-flex flex-column flex-md-row align-items-stretch gap-4">
      <StepBox
        step={1}
        title={translate('Join the pool')}
        description={translate(
          'By accepting this invitation, you join the reviewer pool for this call. This means:',
        )}
        items={[
          translate('You agree to potentially review proposals for this call'),
          translate('No specific proposals are assigned yet at this stage'),
          translate('Your expertise will be matched to suitable proposals'),
        ]}
      />
      <div className="d-flex align-items-center justify-content-center">
        <ArrowRightIcon
          size={20}
          weight="bold"
          className="text-muted rotate-[90deg] md:rotate-[0deg]"
        />
      </div>
      <StepBox
        step={2}
        title={translate('Receive assignments')}
        description={translate(
          'Later, the call manager will assign specific proposals to you. At that time:',
        )}
        items={[
          translate('You will receive an email with your assigned proposals'),
          translate('You can accept or decline each proposal individually'),
          translate('You can declare conflicts of interest at that time'),
        ]}
      />
    </div>
  </AccordionCard>
);
