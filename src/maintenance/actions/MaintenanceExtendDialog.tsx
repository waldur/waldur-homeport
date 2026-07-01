import { ClockClockwiseIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC, useCallback, useMemo, useState } from 'react';
import {
  Form as BSForm,
  ToggleButton,
  ToggleButtonGroup,
} from 'react-bootstrap';
import { Form as FinalForm, Field, useFormState } from 'react-final-form';
import {
  MaintenanceAnnouncement,
  maintenanceAnnouncementsPartialUpdate,
} from 'waldur-js-client';

import { formatDateTime, parseDate } from '@/core/dateUtils';
import { DateTimeField } from '@/form/DateTimeField';
import { FormFooter } from '@/form/FormFooter';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { appendInternalNote } from './internalNotes';

interface MaintenanceExtendDialogProps {
  resolve: {
    maintenance: MaintenanceAnnouncement;
    refetch: () => void;
  };
}

interface ExtendFormValues {
  scheduled_end: string;
  reason?: string;
}

const QUICK_OFFSETS: Array<{ key: string; label: string; minutes: number }> = [
  { key: '30m', label: '+30 min', minutes: 30 },
  { key: '1h', label: '+1 h', minutes: 60 },
  { key: '2h', label: '+2 h', minutes: 120 },
  { key: '4h', label: '+4 h', minutes: 240 },
];

export const MaintenanceExtendDialog: FC<MaintenanceExtendDialogProps> = ({
  resolve: { maintenance, refetch },
}) => {
  const currentEnd = useMemo(
    () => parseDate(maintenance.scheduled_end),
    [maintenance.scheduled_end],
  );

  const initialEnd = useMemo(
    () => currentEnd.plus({ minutes: 30 }).toISO(),
    [currentEnd],
  );

  const extendMutation = useManagedMutation<any, any, ExtendFormValues>({
    mutationFn: (formData) => {
      const body: Record<string, string> = {
        scheduled_end: formData.scheduled_end,
      };
      const trimmedReason = (formData.reason || '').trim();
      if (trimmedReason) {
        body.internal_notes = appendInternalNote(
          maintenance.internal_notes,
          translate('Extend'),
          trimmedReason,
        );
      }
      return maintenanceAnnouncementsPartialUpdate({
        path: { uuid: maintenance.uuid },
        body,
      });
    },
    successMessage: translate('Maintenance has been extended.'),
    errorMessage: translate('Unable to extend maintenance.'),
    refetch,
  });

  return (
    <FinalForm<ExtendFormValues>
      initialValues={{ scheduled_end: initialEnd }}
      validate={(vals) => {
        const errors: Partial<Record<keyof ExtendFormValues, string>> = {};
        if (
          !vals.scheduled_end ||
          parseDate(vals.scheduled_end) <= currentEnd
        ) {
          errors.scheduled_end = translate(
            'New end must be after the current end.',
          );
        }
        return errors;
      }}
      onSubmit={(formData) => extendMutation.mutateAsync(formData)}
      render={({ handleSubmit, form, values }) => (
        <ExtendForm
          handleSubmit={handleSubmit}
          form={form}
          values={values}
          currentEnd={currentEnd}
        />
      )}
    />
  );
};

interface ExtendFormProps {
  handleSubmit: () => void;
  form: any;
  values: ExtendFormValues;
  currentEnd: DateTime;
}

const ExtendForm: FC<ExtendFormProps> = ({
  handleSubmit,
  form,
  values,
  currentEnd,
}) => {
  const { submitting, invalid } = useFormState<ExtendFormValues>();
  const [activeQuickKey, setActiveQuickKey] = useState<string | null>('30m');

  const applyQuickOffset = useCallback(
    (key: string, minutes: number) => {
      const newEnd = currentEnd.plus({ minutes }).toISO();
      form.change('scheduled_end', newEnd);
      setActiveQuickKey(key);
    },
    [currentEnd, form],
  );

  const newEndPreview = values.scheduled_end
    ? formatDateTime(values.scheduled_end)
    : null;

  return (
    <form onSubmit={handleSubmit}>
      <ModalDialog
        title={translate('Extend maintenance')}
        iconNode={<ClockClockwiseIcon weight="bold" />}
        footer={<FormFooter submitLabel={translate('Extend')} />}
      >
        <BSForm.Group className="mb-4">
          <BSForm.Label>{translate('Current end')}</BSForm.Label>
          <div className="form-control-plaintext">
            {formatDateTime(currentEnd)}
          </div>
        </BSForm.Group>

        <BSForm.Group className="mb-4">
          <BSForm.Label>{translate('Quick extend')}</BSForm.Label>
          <div>
            <ToggleButtonGroup
              type="radio"
              name="quick-extend"
              value={activeQuickKey || ''}
              onChange={(value: string) => {
                const offset = QUICK_OFFSETS.find((o) => o.key === value);
                if (offset) applyQuickOffset(offset.key, offset.minutes);
              }}
            >
              {QUICK_OFFSETS.map((offset) => (
                <ToggleButton
                  key={offset.key}
                  id={`quick-extend-${offset.key}`}
                  value={offset.key}
                  variant="tertiary"
                  size="sm"
                  disabled={submitting}
                >
                  {offset.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        </BSForm.Group>

        <BSForm.Group className="mb-4">
          <BSForm.Label>{translate('New end')}</BSForm.Label>
          <Field
            name="scheduled_end"
            render={({ input }) => (
              <DateTimeField
                input={{
                  ...input,
                  onChange: (value) => {
                    input.onChange(value);
                    setActiveQuickKey(null);
                  },
                }}
                dateFormat="Y-m-d H:i"
                minDate={currentEnd.toJSDate()}
                placeholder={translate('Pick a new end date and time')}
              />
            )}
          />
          {newEndPreview && (
            <BSForm.Text className="text-muted">
              {translate('Will be set to: {value}', { value: newEndPreview })}
            </BSForm.Text>
          )}
          {invalid && (
            <BSForm.Text className="text-danger">
              {translate('New end must be after the current end.')}
            </BSForm.Text>
          )}
        </BSForm.Group>

        <BSForm.Group>
          <BSForm.Label>
            {translate('Reason (optional, recorded in internal notes)')}
          </BSForm.Label>
          <Field
            name="reason"
            render={({ input }) => (
              <BSForm.Control
                as="textarea"
                rows={3}
                disabled={submitting}
                {...input}
              />
            )}
          />
        </BSForm.Group>
      </ModalDialog>
    </form>
  );
};
