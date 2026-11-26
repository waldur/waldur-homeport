import { PlusIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { BaseButton, Card, FormField, FormLabel, FormText } from 'waldur-ui';

import { StringField } from '@/form';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { translate } from '@/i18n';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { SimpleTable } from '@/table/SimpleTable';

import { ClaimRow, validateUserClaims } from './utils';

/**
 * Editor for the rule's `user_claims` map.
 *
 * The API shape is `{claim: [accepted, values]}`; react-final-form arrays need
 * a list, so the dialog converts on the way in and out (`claimsToRows` /
 * `rowsToClaims`). Rows rather than a raw JSON textarea because the values are
 * what decide whether a role is granted — a typo should be visible, not buried
 * in unparsed JSON.
 */
interface ClaimTableRow {
  uuid: string;
  name: string;
  remove: () => void;
}

// Cells are module-level components: a column built during render would be a
// new component each time, remounting the inputs and swallowing a click.
const ClaimCell: FC<{ row: ClaimTableRow }> = ({ row }) => (
  <Field name={`${row.name}.claim`}>
    {({ input, meta }) => (
      <StringField
        input={input}
        meta={meta}
        placeholder="roles, entitlements"
      />
    )}
  </Field>
);

const ValuesCell: FC<{ row: ClaimTableRow }> = ({ row }) => (
  <Field name={`${row.name}.values`}>
    {({ input, meta }) => (
      <CommaSeparatedListField
        input={input}
        meta={meta}
        placeholder="acme-owner, acme-admin"
      />
    )}
  </Field>
);

const RemoveCell: FC<{ row: ClaimTableRow }> = ({ row }) => (
  <RemovalActionButton size="md" action={row.remove} />
);

const getColumns = () => [
  { title: translate('Claim'), headerClassName: 'w-1/2', render: ClaimCell },
  { title: translate('Accepted values'), render: ValuesCell },
  { title: '', headerClassName: 'w-[5px]', render: RemoveCell },
];

const ClaimRows: FC<FieldArrayRenderProps<ClaimRow, HTMLElement>> = ({
  fields,
  meta,
}) => {
  const columns = useMemo(getColumns, []);
  return (
    <>
      {fields.length > 0 && (
        // Shares the block with the label and help text, so it carries a border.
        <Card variant="table" bordered className="mb-2">
          <SimpleTable<ClaimTableRow>
            rows={fields.map((name, index) => ({
              uuid: name,
              name,
              remove: () => fields.remove(index),
            }))}
            columns={columns}
          />
        </Card>
      )}
      <div>
        <BaseButton
          label={translate('Add claim')}
          iconNode={<PlusIcon weight="bold" />}
          onClick={() => fields.push({ claim: '', values: [] })}
          variant="tertiary"
          size="sm"
        />
      </div>
      {typeof meta.error === 'string' && (
        <FormText variant="danger" role="alert">
          {meta.error}
        </FormText>
      )}
    </>
  );
};

export const UserClaimsField: FC = () => (
  <FormField className="mb-5.5">
    <FormLabel>{translate('Identity provider claims')}</FormLabel>
    {/* The validator lives on the FieldArray rather than in the dialog's
        record-level validate: final-form resolves errors per registered field,
        so a record-level error keyed to this array is cleared again before it
        reaches the UI. Here it lands in meta.error, which is rendered below. */}
    <FieldArray name="user_claims" validate={validateUserClaims}>
      {(props) => <ClaimRows {...props} />}
    </FieldArray>
    <FormText variant="muted" className="mt-2">
      {translate(
        'All claims must match; within one claim any value matches. A value ending in "*" matches by prefix, e.g. "urn:mace:example.org:group:hpc-*". The claim must be listed in the identity provider\'s extra fields for Waldur to receive it.',
      )}
    </FormText>
  </FormField>
);
