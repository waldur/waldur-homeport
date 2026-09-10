import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Field, useForm } from 'react-final-form';
import { VmwareTemplate, vmwareTemplatesList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { BoxRadioField } from '@/marketplace/deploy/steps/BoxRadioField';
import { StepCardTabs, TabSpec } from '@/marketplace/deploy/steps/StepCardTabs';
import { FormStepProps } from '@/marketplace/deploy/types';
import { generateSystemImageChoices } from '@/marketplace/deploy/utils';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { VStepperFormStepCard } from '@/wizard';

const tabs: TabSpec[] = [
  { title: translate('Images'), key: 'images' },
  { title: translate('Apps'), key: 'apps' },
];

export const FormTemplateStep = (props: FormStepProps) => {
  const form = useForm();
  const [tab, setTab] = useState<TabSpec>(tabs[0]);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'VMwareImages',
      props.offering?.scope_uuid,
      props.offering?.customer_uuid,
    ],

    queryFn: () =>
      props.offering.scope_uuid && props.offering.customer_uuid
        ? getAllPages((page) =>
            vmwareTemplatesList({
              query: {
                page,
                page_size: MAX_PAGE_SIZE,
                settings_uuid: props.offering.scope_uuid,
              },
            }),
          )
        : Promise.resolve([]),

    staleTime: UI_STALE_TIME,
  });

  const choices = useMemo(() => {
    const _choices = generateSystemImageChoices(data);
    _choices.forEach((choice) => {
      choice.image =
        choice.image && typeof choice.image === 'string' ? (
          <img src={choice.image} alt="os" />
        ) : undefined;
    });
    return _choices;
  }, [data]);

  const onChangeImage = useCallback(
    (value: VmwareTemplate) => {
      form.change('limits.cpu', value.cores);
      form.change('limits.ram', value.ram / 1024);
      form.change('limits.disk', value.disk / 1024);
      form.change('attributes.cores_per_socket', value.cores_per_socket);
    },
    [form],
  );

  // The hardware fields of the processor and memory steps register with
  // react-final-form in their own mount effect, and React flushes an earlier
  // sibling's effects first -- this step is rendered before them. Writing cpu,
  // ram and disk straight from a mount effect therefore lands between those
  // fields' render and their registration whenever the templates are served
  // from cache, and the state a field is handed at registration time is
  // dropped: react-final-form assumes it matches what the field just
  // rendered. The field then keeps showing zero for good, since final-form
  // memoizes the subscriber and never re-delivers a value it believes the
  // field already has -- re-picking the same template cannot repair it.
  //
  // Waiting for a second commit keeps the write out of the commit the fields
  // mount in. A field that mounts later is not at risk: it reads the value
  // while rendering.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize template
  //
  // The template field is written here too: nothing else selects a first
  // choice, so without it the hardware steps below would show the first
  // template's cpu, ram and disk while this card highlights nothing, the
  // storage step's Guest OS stays empty and this required step counts as
  // unfinished.
  useEffect(() => {
    if (mounted && data?.length > 0) {
      const template = data[0];
      form.change('attributes.template', template);
      onChangeImage(template);
    }
  }, [mounted, props.offering, data, onChangeImage, form]);

  return (
    <VStepperFormStepCard
      title={translate('Template')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        showExperimentalUiComponents ? (
          <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
        ) : null
      }
    >
      {isLoading ? (
        <p className="text-center">{translate('Loading')}</p>
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : data.length === 0 ? (
        <p className="text-center">
          {translate('There are no option to choose.')}
        </p>
      ) : (
        <Field name="attributes.template" validate={required}>
          {({ input }) => (
            <BoxRadioField
              input={{
                ...input,
                onChange: (value) => {
                  input.onChange(value);
                  onChangeImage(value);
                },
              }}
              choices={choices}
            />
          )}
        </Field>
      )}
    </VStepperFormStepCard>
  );
};
