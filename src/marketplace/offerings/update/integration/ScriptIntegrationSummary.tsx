import { CheckOrX } from '@waldur/core/CheckOrX';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { EditScriptButton } from './EditScriptButton';
import { EditVarsButton } from './EditVarsButton';
import { OfferingEditPanelProps } from './types';
import { SCRIPT_ROWS } from './utils';

export const ScriptIntegrationSummary = ({
  offering,
  refetch,
  loading,
}: OfferingEditPanelProps) => (
  <FormTable.Card
    title={translate('Provisioning configuration')}
    refetch={refetch}
    loading={loading}
    actions={<EditVarsButton offering={offering} refetch={refetch} />}
    className="card-bordered mb-7"
  >
    <FormTable>
      {SCRIPT_ROWS.map((field) => (
        <FormTable.Item
          key={field.type}
          label={field.label}
          value={
            field.type === 'language' ? (
              offering.secret_options[field.type] || 'N/A'
            ) : (
              <CheckOrX value={offering.secret_options[field.type]} />
            )
          }
          actions={
            <EditScriptButton
              type={field.type}
              dry_run={field.dry_run}
              label={field.label}
              offering={offering}
              refetch={refetch}
            />
          }
        />
      ))}
    </FormTable>
  </FormTable.Card>
);
