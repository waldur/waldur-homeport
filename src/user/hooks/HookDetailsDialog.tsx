import { useMemo, FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { AsyncState } from 'react-use/lib/useAsyncFn';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { HookForm } from './HookForm';
import { HookFormData, EventGroupOption, HookResponse } from './types';
import { loadEventGroupsOptions, getInitialValue, useHookForm } from './utils';

interface OwnProps {
  hook: HookResponse;
  eventGroupsState: AsyncState<EventGroupOption[]>;
}

const HookDetailsComponent = ({
  hook,
  eventGroupsState,
  handleSubmit,
  submitting,
  invalid,
}) => {
  const saveHook = useHookForm(hook);
  return (
    <form onSubmit={handleSubmit(saveHook)}>
      <Modal.Header>
        <Modal.Title>
          {hook
            ? translate('Update notification')
            : translate('Create notification')}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {eventGroupsState.loading ? (
          <LoadingSpinner />
        ) : eventGroupsState.error ? (
          <>{translate('Unable to load data.')}</>
        ) : (
          <HookForm eventGroups={eventGroupsState.value} isNew={!hook} />
        )}
      </Modal.Body>

      <Modal.Footer>
        {!eventGroupsState.error && (
          <SubmitButton
            variant="primary"
            block={false}
            submitting={submitting}
            invalid={invalid}
          >
            {hook ? translate('Update') : translate('Create')}
          </SubmitButton>
        )}
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
};

const HookDetails = reduxForm<HookFormData, OwnProps>({ form: 'HookForm' })(
  HookDetailsComponent,
);

export const HookDetailsDialog: FunctionComponent<{ resolve: { hook } }> = ({
  resolve: { hook },
}) => {
  const state = useAsync(loadEventGroupsOptions);
  const initialValues = useMemo(() => getInitialValue(hook), [hook]);
  return (
    <HookDetails
      hook={hook}
      eventGroupsState={state}
      initialValues={initialValues}
    />
  );
};
