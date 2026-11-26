import { PlusIcon } from '@phosphor-icons/react';
import { FC, Fragment } from 'react';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import {
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { StringField } from '@/form';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { translate } from '@/i18n';
import { RemovalActionButton } from '@/table/RemovalActionButton';

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
const ClaimRows: FC<FieldArrayRenderProps<ClaimRow, HTMLElement>> = ({
  fields,
  meta,
}) => (
  <>
    {fields.length > 0 && (
      <Table scrollable={false}>
        <TableHeader>
          <TableRow divided={false}>
            <TableHead className="w-1/2">{translate('Claim')}</TableHead>
            <TableHead>{translate('Accepted values')}</TableHead>
            <TableHead className="w-[5px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((name, index) => (
            <Fragment key={name}>
              <TableRow divided={false}>
                <TableCell>
                  <Field name={`${name}.claim`}>
                    {({ input, meta }) => (
                      <StringField
                        input={input}
                        meta={meta}
                        placeholder="roles, entitlements"
                      />
                    )}
                  </Field>
                </TableCell>
                <TableCell>
                  <Field name={`${name}.values`}>
                    {({ input, meta }) => (
                      <CommaSeparatedListField
                        input={input}
                        meta={meta}
                        placeholder="acme-owner, acme-admin"
                      />
                    )}
                  </Field>
                </TableCell>
                <TableCell>
                  <RemovalActionButton action={() => fields.remove(index)} />
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
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
