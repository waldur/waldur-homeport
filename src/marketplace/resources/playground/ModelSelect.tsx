import { FC } from 'react';

import { Select } from '@/form/select/Select';
import { translate } from '@/i18n';

import { InferenceModelState } from './useInferenceModels';

type ModelSelectProps = Pick<
  InferenceModelState,
  'models' | 'model' | 'error'
> & {
  onChange: (model: string) => void;
};

// The model picker, rendered with the Waldur standard Select. Fed by
// useInferenceModels so the view and the dialog can place it wherever they want.
export const ModelSelect: FC<ModelSelectProps> = ({
  models,
  model,
  error,
  onChange,
}) => (
  // The endpoint/models error is surfaced by the caller as a Waldur AlertItem;
  // here it only drives the placeholder so the disabled control reads sensibly.
  <Select
    size="sm"
    aria-label={translate('Model')}
    options={models.map((m) => ({ label: m, value: m }))}
    value={model ? { label: model, value: model } : null}
    isDisabled={models.length === 0}
    placeholder={
      error ? translate('Models unavailable') : translate('Loading models…')
    }
    onChange={(option: any) => option && onChange(option.value)}
  />
);
