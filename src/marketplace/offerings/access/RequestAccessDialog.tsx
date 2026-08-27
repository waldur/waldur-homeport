import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Col, FormCheck, Row } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { Customer, Offering, Project } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CustomerField } from '@/marketplace/details/CustomerField';
import { ProjectField } from '@/marketplace/details/ProjectField';
import { SubmittableRound } from '@/marketplace/offerings/apply/eligibleCalls';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { usesCallVocabulary } from '@/proposals/presentation';

import { RoundSelectTable } from './RoundSelectTable';
import { AccessMethod, AccessMethodKey } from './types';

// Rough heights of the second step, used to reserve room for the taller branch
// so the dialog does not resize when the route changes. Approximate on purpose:
// they only need to be large enough that neither branch is clipped.
const PROJECT_STEP_HEIGHT = 130;
const ROUNDS_STEP_HEADER = 96;
const ROUNDS_STEP_ROW = 52;

const AddProposalDialog = lazyComponent(() =>
  import('@/proposals/proposal/create/AddProposalDialog').then((module) => ({
    default: module.AddProposalDialog,
  })),
);

interface RequestAccessDialogProps {
  resolve: {
    offering: Offering;
    /** Actionable routes. One entry means the radio group is skipped. */
    methods: AccessMethod[];
    /** Rounds a proposal can be submitted to; empty when applying is not offered. */
    rounds: SubmittableRound[];
  };
}

interface FormData {
  method: AccessMethodKey;
  round?: SubmittableRound;
  // Named to match CustomerField/ProjectField, which read them off form state.
  customer?: Customer;
  project?: Project;
}

const MethodChoice: FC<{ method: AccessMethod }> = ({ method }) => (
  <Field<AccessMethodKey> name="method" type="radio" value={method.key}>
    {({ input }) => (
      <div
        className={`border rounded p-4 ${
          input.checked ? 'border-primary bg-light-primary' : ''
        }`}
      >
        <FormCheck
          {...input}
          type="radio"
          id={`access-method-${method.key}`}
          label={
            <span className="d-flex flex-column">
              <span className="fw-bold">{method.label}</span>
              <span className="text-muted fs-7">{method.description}</span>
            </span>
          }
        />
      </div>
    )}
  </Field>
);

export const RequestAccessDialog: FC<RequestAccessDialogProps> = (props) => {
  const { openDialog, closeDialog } = useModal();
  const { offering, methods, rounds } = props.resolve;

  const initialValues = useMemo<FormData>(
    () => ({
      method: methods[0].key,
      round: rounds.length === 1 ? rounds[0] : undefined,
    }),
    [methods, rounds],
  );

  const projectStep =
    methods.some((method) => method.key === 'order') && offering.shared;
  const roundsStep =
    methods.some((method) => method.key === 'apply') && rounds.length > 1;

  // Only reserve height when the route can actually change under the pointer.
  // With one branch there is nothing to switch to, so let it size itself.
  const reservedHeight =
    projectStep && roundsStep
      ? Math.max(
          PROJECT_STEP_HEIGHT,
          ROUNDS_STEP_HEADER + rounds.length * ROUNDS_STEP_ROW,
        )
      : 0;

  const onSubmit = (values: FormData) => {
    const method = methods.find((item) => item.key === values.method);
    if (!method) {
      return;
    }
    if (method.key === 'order') {
      closeDialog();
      method.run({ customer: values.customer, project: values.project });
      return;
    }
    const selected = values.round || rounds[0];
    if (!selected) {
      return;
    }
    closeDialog();
    openDialog(AddProposalDialog, {
      // Marketplace mode folds the amounts and their prices into that dialog,
      // which the default width clips.
      size: usesCallVocabulary() ? undefined : 'lg',
      resolve: {
        call: selected.call,
        round: selected.round,
        offering,
      },
    });
  };

  return (
    <Form<FormData>
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, values, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              methods.length > 1
                ? translate('Choose how to request this offering')
                : usesCallVocabulary()
                  ? translate('Choose a round for your application')
                  : translate('Choose a submission deadline')
            }
            subtitle={[offering.name, offering.customer_name]
              .filter(Boolean)
              .join(' · ')}
            iconNode={<PaperPlaneTiltIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="min-w-125px" />
                {/* Only rendered fields register with the form, so `invalid`
                    reflects exactly the branch on screen. */}
                <SubmitButton
                  submitting={false}
                  disabled={invalid}
                  label={translate('Continue')}
                  className="btn btn-primary min-w-125px"
                  onClick={handleSubmit}
                />
              </>
            }
          >
            <div className="d-flex flex-column gap-4">
              {methods.length > 1
                ? methods.map((method) => (
                    <MethodChoice key={method.key} method={method} />
                  ))
                : null}

              {/* The two branches reserve one height, so switching route does
                  not resize the dialog under the pointer. */}
              <div style={{ minHeight: reservedHeight }}>
                {/* Ordering lands in a project the user already belongs to.
                    A non-shared offering is bound to its own project, so there
                    is nothing to pick — the wizard fills both in. */}
                {values.method === 'order' && offering.shared ? (
                  <div>
                    {methods.length > 1 ? <hr className="mt-0" /> : null}
                    <div className="fw-bold">{translate('Project')}</div>
                    <div className="text-muted fs-7 mb-4">
                      {translate(
                        'The resource is created in the project you pick.',
                      )}
                    </div>
                    <Row className="align-items-end">
                      <Col sm={6}>
                        <CustomerField
                          organizationGroups={offering.organization_groups}
                          offering={offering}
                        />
                      </Col>
                      <Col sm={6}>
                        <ProjectField
                          offering={offering}
                          setCurrentProjectOnChange={false}
                        />
                      </Col>
                    </Row>
                  </div>
                ) : null}

                {/* The round picker belongs to the application route, and only
                    earns its place when there is more than one to choose. */}
                {values.method === 'apply' && rounds.length > 1 ? (
                  <div>
                    {methods.length > 1 ? <hr className="mt-0" /> : null}
                    <div className="fw-bold">
                      {usesCallVocabulary()
                        ? translate('Round')
                        : translate('Submission deadline')}
                    </div>
                    <div className="text-muted fs-7 mb-4">
                      {usesCallVocabulary()
                        ? translate(
                            'Your proposal is reviewed under the call and round you pick.',
                          )
                        : translate(
                            'Applications are reviewed in batches. Choose the deadline you want yours considered in.',
                          )}
                    </div>
                    <RoundSelectTable rounds={rounds} fieldName="round" />
                  </div>
                ) : null}
              </div>
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
