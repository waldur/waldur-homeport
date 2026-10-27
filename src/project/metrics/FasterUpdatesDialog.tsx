import { FC } from 'react';
import { Form } from 'react-final-form';
import { InstanceMetricsFasterUpdatesRequest } from 'waldur-js-client';

import { SelectGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  getFastDurationOptions,
  getFastIntervalOptions,
  InstanceMetricsPolling,
  postInstanceMetricsPolling,
} from './instanceMetricsPolling';

type FormValues = InstanceMetricsFasterUpdatesRequest;

export const FasterUpdatesDialog: FC<{
  resolve: {
    resourceUuid: string;
    // Given when asked on a volume: its instance is read.
    instanceName?: string;
    // Only intervals faster than the provider's are offered.
    offeringIntervalMinutes: number;
    onSaved(status: InstanceMetricsPolling): void;
  };
}> = ({
  resolve: { resourceUuid, instanceName, offeringIntervalMinutes, onSaved },
}) => {
  const intervalOptions = getFastIntervalOptions(offeringIntervalMinutes);
  const save = useManagedMutation<InstanceMetricsPolling, any, FormValues>({
    mutationFn: (values) =>
      postInstanceMetricsPolling(resourceUuid, 'faster_updates', values),
    successMessage: translate(
      'The metrics are being read now, and then more often.',
    ),
    errorMessage: translate('Unable to speed up the updates.'),
    onSuccess: onSaved,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => save.mutateAsync(values).catch(() => undefined)}
      initialValues={{ interval_minutes: intervalOptions[0]?.value, hours: 24 }}
    >
      {({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Faster updates')}
            subtitle={
              instanceName
                ? translate(
                    'The volume is read with {instance}, the instance it is attached to: read {instance} and its volumes more often for a while. Afterwards they are read at the usual interval again.',
                    { instance: instanceName },
                  )
                : translate(
                    'Read this instance and its volumes more often for a while, for example while you investigate a problem. Afterwards they are read at the usual interval again.',
                  )
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  label={translate('Speed up')}
                  submitting={submitting}
                  variant="primary"
                />
              </>
            }
          >
            <SelectGroup
              name="interval_minutes"
              label={translate('Read')}
              options={intervalOptions}
              simpleValue
              required
            />
            <SelectGroup
              name="hours"
              label={translate('For how long')}
              options={getFastDurationOptions()}
              simpleValue
              required
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
