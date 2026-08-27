import { CheckOrX } from '@/core/CheckOrX';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';

import { EditScriptButton } from './EditScriptButton';
import { EditVarsButton } from './EditVarsButton';
import { OfferingEditPanelProps } from './types';
import {
  canSeeOfferingSecretOptions,
  SCRIPT_ROWS,
  SECRET_OPTIONS_HIDDEN_REASON,
} from './utils';

export const ScriptIntegrationSummary = ({
  offering,
  refetch,
  loading,
}: OfferingEditPanelProps) => {
  // Every row here reads secret_options, which the backend drops from the
  // payload of a user who may not see it. Reading through it would throw at
  // render and take the whole section down; rendering the rows anyway would
  // claim the scripts are unset, and an edit would save that over them.
  const secretOptionsHidden = !canSeeOfferingSecretOptions(offering);

  return (
    <FormTable.Card
      title={translate('Provisioning configuration')}
      refetch={refetch}
      loading={loading}
      actions={
        secretOptionsHidden ? undefined : (
          <EditVarsButton offering={offering} refetch={refetch} />
        )
      }
      className="card-bordered mb-7"
    >
      <FormTable>
        {SCRIPT_ROWS.map((field) => (
          <FormTable.Item
            key={field.type}
            label={field.label}
            tooltip={
              secretOptionsHidden ? SECRET_OPTIONS_HIDDEN_REASON : undefined
            }
            value={
              secretOptionsHidden ? (
                DASH_ESCAPE_CODE
              ) : field.type === 'language' ? (
                renderFieldOrDash(offering.secret_options?.[field.type])
              ) : (
                <CheckOrX value={offering.secret_options?.[field.type]} />
              )
            }
            actions={
              secretOptionsHidden ? undefined : (
                <EditScriptButton
                  type={field.type}
                  dry_run={field.dry_run}
                  label={field.label}
                  offering={offering}
                  refetch={refetch}
                />
              )
            }
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
