import { FC } from 'react';

import { StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const fields: OfferingEditField[] = [
  {
    label: translate('Highlight backend ID display'),
    key: 'plugin_options.highlight_backend_id_display',
    component: AwesomeCheckboxField,
  },
  {
    label: translate('Backend ID display label'),
    key: 'plugin_options.backend_id_display_label',
    component: StringField,
  },
];

export const ResourceDisplayOptionsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <FormTable.Card
      title={translate('Resource display options')}
      className="card-bordered mb-7"
    >
      <FormTable>
        <DefaultOfferingEditPanel
          {...props}
          fields={fields}
          callback={update}
        />
      </FormTable>
    </FormTable.Card>
  );
};
