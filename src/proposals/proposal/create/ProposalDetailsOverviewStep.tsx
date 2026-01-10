import { EyeIcon } from '@phosphor-icons/react';
import { Col, Row } from 'react-bootstrap';
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
import { ActionButton } from '@waldur/table/ActionButton';

const ProposalDetailsDialog = lazyComponent(() =>
  import('../ProposalDetailsDialog').then((module) => ({
    default: module.ProposalDetailsDialog,
  })),
);

const DetailsOverviewButton = ({ proposal }) => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(ProposalDetailsDialog, {
            proposal,
          }),
        )
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
