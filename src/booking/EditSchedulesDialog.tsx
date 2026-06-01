import arrayMutators from 'final-form-arrays';
import { useMemo } from 'react';
import { Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { marketplaceProviderOfferingsUpdateAttributes } from 'waldur-js-client';

import { pick } from '@/core/utils';
import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { OfferingScheduler } from './OfferingScheduler';

const formatSchedules = (schedules: any[]) =>
  schedules
    .filter((item) => Object.keys(item).length > 0)
    .map(pick(['start', 'end', 'title', 'allDay', 'extendedProps', 'id']));

export const EditSchedulesDialog = (props: {
  resolve: { offering; refetch };
}) => {
  const initialValues = useMemo(
    () => ({
      schedules:
        props.resolve.offering.attributes?.schedules?.map((sch) => {
          // Convert string dates to JS Dates
          const newSch = { ...sch };
          if (typeof newSch.start === 'string')
            newSch.start = new Date(newSch.start);
          if (typeof newSch.end === 'string') newSch.end = new Date(newSch.end);
          return newSch;
        }) || [],
    }),
    [props.resolve.offering.attributes?.schedules],
  );

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateAttributes({
        path: { uuid: props.resolve.offering.uuid },
        body: {
          ...props.resolve.offering.attributes,
          schedules: formatSchedules(formData.schedules),
        },
      }),
    successMessage: translate('Schedules have been updated successfully.'),
    errorMessage: translate('Unable to update schedules.'),
    refetch: props.resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update schedule')}
            footer={<FormFooter submitLabel={translate('Update')} />}
          >
            <div className="size-xl">
              <FieldArray
                name="schedules"
                rerenderOnEveryChange
                component={OfferingScheduler}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
