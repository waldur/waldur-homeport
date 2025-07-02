import { EyeIcon } from '@phosphor-icons/react';
import { Button, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  VStepperFormStepCard,
  VStepperFormStepProps,
} from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { EndingField } from '@waldur/proposals/EndingField';
import { Proposal } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';

const ProposalDetailsDialog = lazyComponent(() =>
  import('../ProposalDetailsDialog').then((module) => ({
    default: module.ProposalDetailsDialog,
  })),
);

const DetailsOverviewButton = ({ proposal }) => {
  const dispatch = useDispatch();
  return (
    <Button
      variant="outline btn-outline-default"
      className="ms-auto"
      onClick={() =>
        dispatch(
          openModalDialog(ProposalDetailsDialog, {
            proposal,
          }),
        )
      }
    >
      <span className="svg-icon svg-icon-2">
        <EyeIcon weight="bold" />
      </span>
      {translate('More details')}
    </Button>
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
              <EndingField endDate={proposal.round.cutoff_time} dateFirst />
            }
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Round reference')}
            value={proposal.round.name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
      </Row>
    </VStepperFormStepCard>
  );
};
