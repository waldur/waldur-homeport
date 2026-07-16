import { FC } from 'react';

import {
  BooleanEditField,
  EditFieldProvider,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingBackendIdRules } from './utils';

const UNIQUENESS_SCOPE_OPTIONS = [
  {
    value: 'offering',
    label: translate('This offering — unique within this offering only'),
  },
  {
    value: 'offering_group',
    label: translate(
      'Offering group — unique across offerings sharing this offering’s backend ID',
    ),
  },
  {
    value: 'service_provider',
    label: translate(
      'Service provider — unique across all of this provider’s offerings',
    ),
  },
  {
    value: 'service_provider_category',
    label: translate(
      'Service provider & category — unique across this provider’s offerings in the same category',
    ),
  },
];

export const BackendIdRulesSection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingBackendIdRules(
    props.offering,
    props.refetch,
  );

  return (
    <FormTable.Card
      title={translate('Backend ID rules')}
      className="card-bordered mb-7"
    >
      <FormTable>
        <EditFieldProvider scope={props.offering} callback={update}>
          <StringEditField
            name="backend_id_rules.format.regex"
            label={translate('Backend ID format (regex)')}
            description={translate(
              'Regular expression that a resource backend ID must fully match. Applied when importing a resource or setting its backend ID. Leave empty to allow any value.',
            )}
            parse={(value) => value ?? null}
          />
          <StringEditField
            name="backend_id_rules.format.description"
            label={translate('Format hint')}
            description={translate(
              'Human-readable hint shown to the user when a backend ID fails the format regex.',
            )}
            parse={(value) => value ?? null}
          />
          <SelectEditField
            name="backend_id_rules.uniqueness.scope"
            label={translate('Uniqueness scope')}
            options={UNIQUENESS_SCOPE_OPTIONS}
            simpleValue
            isClearable
            description={translate(
              'When set, a resource backend ID must be unique within the chosen scope. Leave empty to disable the uniqueness check.',
            )}
          />
          <BooleanEditField
            name="backend_id_rules.uniqueness.include_terminated"
            label={translate('Count terminated resources')}
            description={translate(
              'When enabled (default), terminated resources are included in the uniqueness check. Disable to allow reusing the backend ID of a terminated resource.',
            )}
          />
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
