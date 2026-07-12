import { ClipboardTextIcon, EyeIcon } from '@phosphor-icons/react';
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

const ProposalReviewsDialog = lazyComponent(() =>
  import('../ProposalReviewsDialog').then((module) => ({
    default: module.ProposalReviewsDialog,
  })),
);

const DetailsOverviewButton = ({ proposal, reviews }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() =>
        openDialog(ProposalDetailsDialog, {
          proposal,
          reviews,
        })
      }
      title={translate('More details')}
      iconNode={<EyeIcon weight="bold" />}
      variant="tertiary"
    />
  );
};

const ReviewsButton = ({ proposal }) => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() => openDialog(ProposalReviewsDialog, { proposal })}
      title={translate('Reviews')}
      iconNode={<ClipboardTextIcon weight="bold" />}
      variant="tertiary"
    />
  );
};

export const ProposalDetailsOverviewStep = (props: VStepperFormStepProps) => {
  const proposal: Proposal = props.params.proposal;
  // Only surfaced where reviews are relevant (call-manager proposal view); the
  // backend also scopes review visibility.
  const canViewReviews: boolean = props.params.canViewReviews;
  return (
    <VStepperFormStepCard
      id={props.id}
      title={translate('Details overview')}
      actions={
        <div className="d-flex gap-2">
          {canViewReviews && <ReviewsButton proposal={proposal} />}
          <DetailsOverviewButton
            proposal={proposal}
            reviews={props.params.reviews}
          />
        </div>
      }
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
