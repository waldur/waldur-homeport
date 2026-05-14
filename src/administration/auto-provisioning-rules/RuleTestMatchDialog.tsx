import {
  CheckCircleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  autoprovisioningRulesTestMatch,
  type FilterCheckResult,
  type Rule,
  type RuleTestMatchResponse,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { ENV } from '@/core/config';
import { SubmitButton } from '@/form';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';

interface UserOption {
  uuid: string;
  full_name?: string;
  username?: string;
  email?: string;
  url?: string;
}

const loadUsers = async (query: string, prevOptions, { page }) => {
  const result = await userAutocomplete(query, prevOptions, { page });
  return {
    ...result,
    options: (result as any).options.map((u: UserOption) => ({
      ...u,
      value: u.uuid,
      label: u.full_name || u.email || u.username,
    })),
  };
};

const FilterRow: FC<{ result: FilterCheckResult }> = ({ result }) => {
  const valueOf = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : '—';
    }
    return String(value);
  };
  const iconClass = !result.configured
    ? 'text-muted'
    : result.matched
      ? 'text-success'
      : 'text-danger';
  return (
    <tr>
      <td>
        {!result.configured ? (
          <WarningCircleIcon size={16} weight="bold" className={iconClass} />
        ) : result.matched ? (
          <CheckCircleIcon size={16} weight="bold" className={iconClass} />
        ) : (
          <XCircleIcon size={16} weight="bold" className={iconClass} />
        )}
      </td>
      <td className="fw-semibold">{result.name}</td>
      <td>{valueOf(result.rule_value)}</td>
      <td>{valueOf(result.user_value)}</td>
      <td className="text-muted">{result.reason}</td>
    </tr>
  );
};

const ResultPanel: FC<{ result: RuleTestMatchResponse }> = ({ result }) => {
  const verdictClass = result.would_provision ? 'text-success' : 'text-danger';
  return (
    <div className="mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        {result.would_provision ? (
          <CheckCircleIcon size={24} weight="bold" className={verdictClass} />
        ) : (
          <XCircleIcon size={24} weight="bold" className={verdictClass} />
        )}
        <span className={`fs-5 fw-bold ${verdictClass}`}>
          {result.would_provision
            ? translate('Would provision')
            : translate('Blocked')}
        </span>
        {result.would_provision && result.resolved_project_name && (
          <span className="text-muted">
            {translate('Project name preview: {name}', {
              name: result.resolved_project_name,
            })}
          </span>
        )}
      </div>
      {result.block_reason && (
        <div className="alert alert-warning py-2 px-3 mb-3">
          {result.block_reason}
        </div>
      )}

      <h6 className="mt-4 mb-2">{translate('Filter outcomes')}</h6>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th style={{ width: 24 }} />
              <th>{translate('Filter')}</th>
              <th>{translate('Rule value')}</th>
              <th>{translate('User value')}</th>
              <th>{translate('Reason')}</th>
            </tr>
          </thead>
          <tbody>
            {result.filter_results.map((fr) => (
              <FilterRow key={fr.name} result={fr} />
            ))}
          </tbody>
        </table>
      </div>

      {result.customer_lookup_performed && (
        <>
          <h6 className="mt-4 mb-2">{translate('Organization lookup')}</h6>
          {result.customer_candidates.length === 0 ? (
            <div className="alert alert-danger py-2 px-3 mb-0">
              {translate(
                'No Waldur organization matches the user\'s IdP organization ("{name}").',
                { name: result.user_organization || '—' },
              )}
            </div>
          ) : result.customer_lookup_ambiguous ? (
            <div className="alert alert-danger py-2 px-3 mb-0">
              <div className="fw-semibold mb-1">
                {translate(
                  'Ambiguous — {count} organizations share this name.',
                  { count: result.customer_candidates.length },
                )}
              </div>
              <ul className="mb-0">
                {result.customer_candidates.map((c) => (
                  <li key={c.uuid}>
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noreferrer">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                    {c.abbreviation ? ` (${c.abbreviation})` : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="alert alert-success py-2 px-3 mb-0">
              {translate('Matched organization: {name}', {
                name: result.customer_candidates[0].name,
              })}
            </div>
          )}
        </>
      )}

      <h6 className="mt-4 mb-2">{translate('User attributes')}</h6>
      <dl className="row mb-0 small">
        <dt className="col-sm-4">{translate('Username')}</dt>
        <dd className="col-sm-8">{renderFieldOrDash(result.user_username)}</dd>
        <dt className="col-sm-4">{translate('Email')}</dt>
        <dd className="col-sm-8">{renderFieldOrDash(result.user_email)}</dd>
        <dt className="col-sm-4">{translate('Organization (from IdP)')}</dt>
        <dd className="col-sm-8">
          {renderFieldOrDash(result.user_organization)}
        </dd>
        <dt className="col-sm-4">{translate('Registration method')}</dt>
        <dd className="col-sm-8">
          {renderFieldOrDash(result.user_registration_method)}
        </dd>
        <dt className="col-sm-4">{translate('Identity source')}</dt>
        <dd className="col-sm-8">
          {renderFieldOrDash(result.user_identity_source)}
        </dd>
        <dt className="col-sm-4">{translate('Affiliations')}</dt>
        <dd className="col-sm-8">
          {renderFieldOrDash(result.user_affiliations.join(', '))}
        </dd>
        <dt className="col-sm-4">{translate('Details protected')}</dt>
        <dd className="col-sm-8">
          {result.user_is_protected ? (
            <Badge variant="purple" outline>
              {translate('Yes')}
            </Badge>
          ) : (
            <Badge variant="default" outline>
              {translate('No')}
            </Badge>
          )}
        </dd>
      </dl>
    </div>
  );
};

interface RuleTestMatchDialogProps {
  resolve: { rule: Rule };
}

export const RuleTestMatchDialog: FC<RuleTestMatchDialogProps> = ({
  resolve,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [result, setResult] = useState<RuleTestMatchResponse | null>(null);

  const protectedMethods =
    ENV.plugins.WALDUR_CORE.PROTECT_USER_DETAILS_FOR_REGISTRATION_METHODS || [];

  const mutation = useMutation({
    mutationFn: async (userUuid: string) => {
      const response = await autoprovisioningRulesTestMatch({
        path: { uuid: resolve.rule.uuid },
        body: { user_uuid: userUuid },
      });
      return response.data as RuleTestMatchResponse;
    },
    onSuccess: (data) => setResult(data),
  });

  const onSubmit = () => {
    if (!selectedUser?.uuid) return;
    mutation.mutate(selectedUser.uuid);
  };

  return (
    <ModalDialog
      title={translate('Test rule against user — {rule}', {
        rule: resolve.rule.name,
      })}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            type="button"
            onClick={onSubmit}
            disabled={!selectedUser?.uuid || mutation.isPending}
            submitting={mutation.isPending}
            label={translate('Run test')}
            className="btn btn-primary"
          />
        </>
      }
    >
      <div>
        <label className="form-label fw-semibold">
          {translate('Target user')}
        </label>
        <AsyncPaginate
          value={selectedUser}
          onChange={(opt) => {
            setSelectedUser(opt as UserOption);
            setResult(null);
          }}
          loadOptions={loadUsers}
          defaultOptions
          placeholder={translate('Search by name, email or username...')}
          classNamePrefix="metronic-select"
          isClearable
          getOptionLabel={(opt) =>
            (opt as UserOption).full_name ||
            (opt as UserOption).email ||
            (opt as UserOption).username ||
            ''
          }
          getOptionValue={(opt) => (opt as UserOption).uuid}
        />

        {resolve.rule.use_user_organization_as_customer_name &&
          protectedMethods.length === 0 && (
            <div className="alert alert-warning py-2 px-3 mt-3 mb-0">
              {translate(
                'This rule resolves the organization from the user IdP claim, but no protected registration methods are configured. No user will currently pass the protection check.',
              )}
            </div>
          )}

        {mutation.error && (
          <div className="alert alert-danger py-2 px-3 mt-3 mb-0">
            {translate('Test failed: {error}', {
              error:
                (mutation.error as Error).message || translate('Unknown error'),
            })}
          </div>
        )}

        {result && <ResultPanel result={result} />}
      </div>
    </ModalDialog>
  );
};
