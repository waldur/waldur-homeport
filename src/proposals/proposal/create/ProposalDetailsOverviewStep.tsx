import { EyeIcon } from '@phosphor-icons/react';
import { Col, Row } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { EndingField } from '@/proposals/EndingField';
import { Proposal } from '@/proposals/types';
import { Field } from '@/resource/summary';
import { ActionButton } from '@/table/ActionButton';
import { renderFieldOrDash } from '@/table/utils';
import { VStepperFormStepCard, VStepperFormStepProps } from '@/wizard';

const ProposalDetailsDialog = lazyComponent(() =>
  import('../ProposalDetailsDialog').then((module) => ({
    default: module.ProposalDetailsDialog,
  })),
);

const DetailsOverviewButton = ({ proposal }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() =>
        openDialog(ProposalDetailsDialog, {
          proposal,
        })
      }
      title={translate('More details')}
      iconNode={<EyeIcon weight="bold" />}
      variant="tertiary"
      className="ms-auto"
    />
  );
};

export const ProposalDetailsOverviewStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  return (
    <VStepperFormStepCard
      id={props.id}
      title={translate('Details overview')}
      actions={<DetailsOverviewButton proposal={proposal} />}
    >
      <Row className="fs-6">
        <Col sm={6}>
          <Field
            label={translate('Call name')}
            value={proposal.call_name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Round deadline')}
            value={
              <EndingField endDate={proposal.round?.cutoff_time} dateFirst />
            }
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Round reference')}
            value={renderFieldOrDash(proposal.round?.name)}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Created by')}
            value={proposal.created_by_name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
      </Row>
    </VStepperFormStepCard>
  );
};
