import { get } from 'lodash-es';
import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { SecretField, StringField } from '@/form';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SecretField as PlainSecretField } from '@/marketplace/common/SecretField';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { FieldEditButton } from './FieldEditButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

interface LexisLinkField {
  key: string;
  label: string;
  isSecret: boolean;
  component: any;
}

const fields: LexisLinkField[] = [
  {
    key: 'plugin_options.heappe_url',
    label: translate('HEAppE URL'),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'plugin_options.heappe_username',
    label: translate('HEAppE username'),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'plugin_options.heappe_cluster_id',
    label: translate('HEAppE cluster ID'),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'plugin_options.heappe_local_base_path',
    label: translate('HEAppE local base path'),
    isSecret: false,
    component: StringField,
  },
  {
    key: 'secret_options.heappe_password',
    label: translate('HEAppE password'),
    isSecret: true,
    component: SecretField,
  },
  {
    key: 'secret_options.heappe_cluster_password',
    label: translate('HEAppE cluster password'),
    isSecret: true,
    component: SecretField,
  },
];

export const LexisLinkIntegrationSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  if (!isFeatureVisible(MarketplaceFeatures.lexis_links)) {
    return null;
  }

  return (
    <FormTable.Card
      title={translate('LEXIS integration')}
      className="card-bordered mb-7"
    >
      <FormTable>
        {fields.map((field) => {
          const value = get(props.offering, field.key);
          return (
            <FormTable.Item
              key={field.key}
              label={field.label}
              value={
                field.isSecret ? (
                  <PlainSecretField value={value} />
                ) : (
                  value || DASH_ESCAPE_CODE
                )
              }
              actions={
                <FieldEditButton
                  title={field.label}
                  scope={props.offering}
                  name={field.key}
                  callback={update}
                  fieldComponent={field.component}
                />
              }
            />
          );
        })}
      </FormTable>
    </FormTable.Card>
  );
};
