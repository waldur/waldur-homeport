import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { FC, Fragment } from 'react';
import { Form, FormLabel } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import { IconButton } from '@/core/buttons/IconButton';
import { StringField } from '@/form';
import { CommaSeparatedListField } from '@/form/CommaSeparatedListField';
import { translate } from '@/i18n';

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
      <table className="table px-0 mb-2">
        <thead>
          <tr>
            <td className="w-40">{translate('Claim')}</td>
            <td>{translate('Accepted values')}</td>
            <td className="w-5px" />
          </tr>
        </thead>
        <tbody>
          {fields.map((name, index) => (
            <Fragment key={name}>
              <tr>
                <td>
                  <Field name={`${name}.claim`}>
                    {({ input, meta }) => (
                      <StringField
                        input={input}
                        meta={meta}
                        placeholder="roles, entitlements"
                      />
                    )}
                  </Field>
                </td>
                <td>
                  <Field name={`${name}.values`}>
                    {({ input, meta }) => (
                      <CommaSeparatedListField
                        input={input}
                        meta={meta}
                        placeholder="acme-owner, acme-admin"
                      />
                    )}
                  </Field>
                </td>
                <td>
                  <IconButton
                    iconNode={<TrashIcon weight="bold" />}
                    tooltip={translate('Remove')}
                    onClick={() => fields.remove(index)}
                    variant="danger"
                  />
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    )}
    <div>
      <IconButton
        iconNode={<PlusCircleIcon weight="bold" />}
        tooltip={translate('Add claim')}
        onClick={() => fields.push({ claim: '', values: [] })}
        variant="tertiary"
      />
    </div>
    {typeof meta.error === 'string' && (
      <div className="text-danger small mt-2">{meta.error}</div>
    )}
  </>
);

export const UserClaimsField: FC = () => (
  <Form.Group className="mb-7">
    <FormLabel>{translate('Identity provider claims')}</FormLabel>
    {/* The validator lives on the FieldArray rather than in the dialog's
        record-level validate: final-form resolves errors per registered field,
        so a record-level error keyed to this array is cleared again before it
        reaches the UI. Here it lands in meta.error, which is rendered below. */}
    <FieldArray name="user_claims" validate={validateUserClaims}>
      {(props) => <ClaimRows {...props} />}
    </FieldArray>
    <Form.Text className="text-muted">
      {translate(
        'All claims must match; within one claim any value matches. A value ending in "*" matches by prefix, e.g. "urn:mace:example.org:group:hpc-*". The claim must be listed in the identity provider\'s extra fields for Waldur to receive it.',
      )}
    </Form.Text>
  </Form.Group>
);
