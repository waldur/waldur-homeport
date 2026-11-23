import { FC, useEffect, useMemo } from 'react';
import { Field, useForm, useFormState } from 'react-final-form';
import {
  PatTemplate,
  PatTemplateTarget,
  personalAccessTokensTemplateTargetsList,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  Code,
  FormHeading,
  FormText,
  PropertyItem,
  PropertyList,
  RadioGroup,
  Switch,
} from 'waldur-ui';
import { WizardModal, WizardStepProps } from 'waldur-wizard';

import { required } from '@/core/validators';
import {
  DateGroup,
  FormGroup,
  RadioGroup as RadioFieldGroup,
  StringGroup,
} from '@/form';
import { AsyncSelect, createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { labelForType } from '../entityFetchers';
import { getPermissionLabel, ScopeGroup } from '../scopeOptions';

import { CustomBindingsField } from './CustomBindingsField';
import { CustomPermissionPicker } from './CustomPermissionPicker';
import {
  BindingRow,
  CUSTOM_PURPOSE,
  getCustomBindings,
  getDefaultExpiry,
  getTemplateScopes,
  hasGlobalScope,
  isGeneratedName,
  parseNetworks,
  STAFF_ACCESS,
  canUseDedicatedUser,
  getTokenFor,
  TokenFor,
  TokenWizardStepKey,
  TokenWizardValues,
} from './tokenPayload';

export interface TokenWizardData {
  templates: PatTemplate[];
  scopeGroups: ScopeGroup[];
  /** Entity types at least one of the user's permissions can be bound to. */
  bindingTypes: string[];
  /** Permission -> the entity types it can be bound to. */
  bindingTargets: Record<string, string[]>;
  /** Staff may create the token for a new dedicated user instead. */
  isStaff: boolean;
}

export const describeBinding = (row: BindingRow) =>
  `${row.entity?.name ?? ''} (${labelForType(row.type ?? '')})`;

const getTemplate = (data: TokenWizardData, purpose?: string) =>
  data.templates.find((t) => t.key === purpose);

const getTargetLabel = (target: PatTemplateTarget) =>
  target.context
    ? `${target.name} (${labelForType(target.type)}, ${target.context})`
    : `${target.name} (${labelForType(target.type)})`;

const StaffAccessWarning: FC = () => (
  <AlertItem
    type="floating"
    variant="warning"
    title={translate('Full staff access')}
    body={translate(
      'This token gets full staff access: it can do everything you can as staff, everywhere, not only on this offering. Recommended: give a dedicated user the offering manager role on this offering and create the agent token as that user, so the token is restricted to the offering.',
    )}
    className="mb-3"
    data-testid="staff-access-warning"
  />
);

const TargetOption: FC<{ target: PatTemplateTarget }> = ({ target }) => (
  <span className="inline-flex items-center gap-1.5">
    {getTargetLabel(target)}
    {target.staff_access && (
      <Badge variant="warning" data-testid="staff-access-badge">
        {translate('Full staff access')}
      </Badge>
    )}
  </span>
);

// Targets reached through a role first, staff access last; the sort is
// stable, so the backend's order holds within each.
const sortTargets = (targets: PatTemplateTarget[]) =>
  [...targets].sort((a, b) => Number(a.staff_access) - Number(b.staff_access));

const requireTarget = (value?: PatTemplateTarget | null) =>
  value ? undefined : translate('Choose where the token is used.');

const requireScopes = (value?: string[]) =>
  value?.length ? undefined : translate('Select at least one permission.');

const StepHeading: FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <>
    <h4 className="mb-1.5">{title}</h4>
    <p className="text-quaternary mb-5">{description}</p>
  </>
);

const PurposeStep: FC<WizardStepProps> = (props) => {
  const data: TokenWizardData = props.data;
  const form = useForm<TokenWizardValues>();

  const options = useMemo(
    () => [
      ...data.templates.map((template) => ({
        value: template.key,
        label: template.name,
        description: template.description,
      })),
      {
        value: CUSTOM_PURPOSE,
        label: translate('Custom'),
        description: translate(
          'Choose the permissions and the entities the token is restricted to yourself.',
        ),
      },
    ],
    [data.templates],
  );

  return (
    <WizardModal {...props}>
      <StepHeading
        title={translate('What is the token for?')}
        description={translate(
          'A purpose gives the token exactly the permissions it needs.',
        )}
      />
      <Field<string> name="purpose" validate={required}>
        {({ input }) => (
          <RadioGroup
            label={translate('Purpose')}
            options={options}
            value={input.value || undefined}
            onValueChange={(value) => {
              if (value === input.value) return;
              const template = getTemplate(data, String(value));
              const current = form.getState().values;
              // Everything chosen later depends on the purpose.
              form.batch(() => {
                if (isGeneratedName(current)) {
                  form.change('name', '');
                  form.change('generatedName', undefined);
                }
                form.change('purpose', String(value));
                form.change('target', null);
                form.change('features', []);
                form.change('tokenFor', undefined);
                form.change('agentUsername', undefined);
                form.change('scopes', []);
                form.change('allowed_scopes', []);
                form.change(
                  'expires_at',
                  template
                    ? getDefaultExpiry(template.default_lifetime_days)
                    : '',
                );
              });
            }}
          />
        )}
      </Field>
    </WizardModal>
  );
};

const TemplateTargetField: FC<{ template: PatTemplate }> = ({ template }) => {
  const form = useForm<TokenWizardValues>();
  const loadOptions = useMemo(() => {
    const load = createLoadOptions(
      personalAccessTokensTemplateTargetsList,
      'name',
      { template: template.key },
    );
    return async (...args: Parameters<typeof load>) => {
      const result = await load(...args);
      return { ...result, options: sortTargets(result.options as any) };
    };
  }, [template.key]);

  return (
    <Field<PatTemplateTarget | null> name="target" validate={requireTarget}>
      {({ input, meta }) => (
        <FormGroup
          label={translate('Target')}
          required
          description={translate(
            'Only the entities where you can grant everything this token needs are listed.',
          )}
          meta={meta}
        >
          <AsyncSelect
            key={template.key}
            aria-label={translate('Target')}
            value={input.value || null}
            onChange={(selected: PatTemplateTarget | null) => {
              const current = form.getState().values;
              form.batch(() => {
                form.change('target', selected ?? null);
                // What can be added depends on the target.
                form.change('features', []);
                form.change('tokenFor', undefined);
                form.change('agentUsername', undefined);
                if (selected && isGeneratedName(current)) {
                  const name = `${template.name}: ${selected.name}`;
                  form.change('name', name);
                  form.change('generatedName', name);
                }
              });
            }}
            onBlur={input.onBlur}
            loadOptions={loadOptions}
            defaultOptions
            getOptionValue={(option: PatTemplateTarget) =>
              `${option.type}:${option.uuid}`
            }
            getOptionLabel={getTargetLabel}
            formatOptionLabel={(option: PatTemplateTarget) => (
              <TargetOption target={option} />
            )}
            placeholder={translate('Search...')}
            noOptionsMessage={() => translate('No matches')}
          />
        </FormGroup>
      )}
    </Field>
  );
};

const TargetStep: FC<WizardStepProps> = (props) => {
  const data: TokenWizardData = props.data;
  const { values } = useFormState<TokenWizardValues>();
  const template = getTemplate(data, values.purpose);

  return (
    <WizardModal {...props}>
      <StepHeading
        title={translate('Where will the token be used?')}
        description={
          template
            ? translate(
                'The token works only on the entity you choose here, and only as long as you keep your role on it.',
              )
            : translate(
                'Restrict the token to the entities it should act on, or leave it unrestricted.',
              )
        }
      />
      {template ? (
        <TemplateTargetField template={template} />
      ) : (
        <CustomBindingsField
          types={data.bindingTypes}
          globalScopeSelected={hasGlobalScope(values.scopes ?? [])}
        />
      )}
    </WizardModal>
  );
};

const TokenForChoice: FC<{ target: PatTemplateTarget; tokenFor: TokenFor }> = ({
  target,
  tokenFor,
}) => (
  // Form groups, so the choice and the username get the form's spacing.
  <div data-testid="token-for-choice">
    <RadioFieldGroup
      name="tokenFor"
      label={translate('Who is the token for?')}
      // The default is shown until a choice is stored.
      defaultValue={tokenFor}
      options={[
        {
          value: 'agent_user',
          label: translate('A new dedicated agent user (recommended)'),
          description: translate(
            'A user that only manages {offering}, with a token restricted to it.',
            { offering: target.name },
          ),
        },
        {
          value: 'me',
          label: target.staff_access
            ? translate('Me, with full staff access')
            : translate('Me, restricted to this offering'),
        },
      ]}
    />
    {tokenFor === 'agent_user' && (
      <StringGroup
        name="agentUsername"
        label={translate('Username of the new user')}
        placeholder={target.suggested_username || undefined}
        description={
          target.suggested_username
            ? translate(
                'Leave empty to use {username}. The user has no password and can only act through its tokens.',
                { username: target.suggested_username },
              )
            : translate(
                'The user has no password and can only act through its tokens.',
              )
        }
      />
    )}
  </div>
);

const TemplatePermissions: FC<{ template: PatTemplate; isStaff: boolean }> = ({
  template,
  isStaff,
}) => {
  const form = useForm<TokenWizardValues>();
  const { values } = useFormState<TokenWizardValues>();
  const showChoice = canUseDedicatedUser(template, values.target, isStaff);
  const tokenFor = getTokenFor(values, template, isStaff);
  const staffAccess = !!values.target?.staff_access && tokenFor === 'me';
  const grantable = new Set(values.target?.features ?? []);
  const features = template.optional_features.filter((feature) =>
    grantable.has(feature.key),
  );
  const enabled = values.features ?? [];

  return (
    <>
      {values.target && (
        <p className="mb-3">
          {translate('Token for {target}', {
            target: getTargetLabel(values.target),
          })}
        </p>
      )}
      {showChoice && values.target && (
        <TokenForChoice target={values.target} tokenFor={tokenFor} />
      )}
      {staffAccess && <StaffAccessWarning />}
      <FormHeading as="p">{translate('Always included')}</FormHeading>
      <ul className="mb-5 ps-5 list-disc" data-testid="required-scopes">
        {[
          ...template.required_scopes,
          ...(staffAccess ? [STAFF_ACCESS] : []),
        ].map((scope) => (
          <li key={scope}>
            {getPermissionLabel(scope)}{' '}
            <Code className="text-quaternary text-xs">{scope}</Code>
          </li>
        ))}
      </ul>
      {features.length > 0 && (
        <>
          <FormHeading as="p">{translate('Optional features')}</FormHeading>
          <div className="flex flex-col gap-2.5">
            {features.map((feature) => (
              <Switch
                key={feature.key}
                checked={enabled.includes(feature.key)}
                onCheckedChange={(checked) =>
                  form.change(
                    'features',
                    checked
                      ? [...enabled, feature.key]
                      : enabled.filter((key) => key !== feature.key),
                  )
                }
                label={feature.name}
                description={feature.description}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

const PermissionsStep: FC<WizardStepProps> = (props) => {
  const data: TokenWizardData = props.data;
  const { values, errors } = useFormState<TokenWizardValues>();
  const template = getTemplate(data, values.purpose);
  // Any restriction row, filled in or not, rules global access out.
  const hasBindings = (values.allowed_scopes ?? []).length > 0;

  return (
    <WizardModal {...props}>
      <StepHeading
        title={translate('What can the token do?')}
        description={translate(
          'The token can only use permissions you hold yourself.',
        )}
      />
      {template ? (
        <TemplatePermissions template={template} isStaff={data.isStaff} />
      ) : (
        <>
          <Field<string[]>
            name="scopes"
            validate={requireScopes}
            render={(fieldProps) => (
              <CustomPermissionPicker
                {...fieldProps}
                groups={data.scopeGroups}
                hasBindings={hasBindings}
              />
            )}
          />
          {errors?.restrictions && (
            <FormText variant="danger" as="p" className="mt-2.5">
              {errors.restrictions}
            </FormText>
          )}
        </>
      )}
    </WizardModal>
  );
};

const LimitsStep: FC<WizardStepProps> = (props) => {
  const minDate = useMemo(() => getDefaultExpiry(1), []);
  return (
    <WizardModal {...props}>
      <StepHeading
        title={translate('Name and limits')}
        description={translate(
          'Limit how long and from where the token can be used.',
        )}
      />
      <StringGroup
        name="name"
        validate={required}
        placeholder={translate('e.g. CI/CD pipeline token')}
        label={translate('Token name')}
        required
      />
      <DateGroup
        name="expires_at"
        validate={required}
        minDate={minDate}
        placeholder={translate('Select expiration date')}
        label={translate('Expiration date')}
        required
        description={translate('The token will stop working after this date.')}
      />
      <StringGroup
        name="allowed_networks"
        label={translate('Allowed networks')}
        description={translate(
          'Optional comma-separated list of CIDR networks, e.g. 203.0.113.0/24. Leave empty to allow any source.',
        )}
      />
      <AlertItem
        type="floating"
        variant="info"
        title={translate(
          'The token acts as you. It stops working if you lose the role that grants its permissions.',
        )}
      />
    </WizardModal>
  );
};

const ReviewStep: FC<WizardStepProps> = (props) => {
  const data: TokenWizardData = props.data;
  const { values, errors } = useFormState<TokenWizardValues>();
  // Answers cleared after they were given, by going back and changing an
  // earlier one: the token cannot be created until they are given again.
  const missing = Object.values(errors ?? {}).filter(
    (error): error is string => typeof error === 'string',
  );
  const template = getTemplate(data, values.purpose);
  const tokenFor = getTokenFor(values, template, data.isStaff);
  const forAgentUser = !!template && tokenFor === 'agent_user';
  const staffAccess =
    !!template && !!values.target?.staff_access && tokenFor === 'me';
  const scopes = template
    ? getTemplateScopes(
        template,
        values.target,
        values.features ?? [],
        staffAccess,
      )
    : (values.scopes ?? []);
  // Exactly what the token is sent with.
  const bindings = template ? [] : getCustomBindings(values);
  const entityNames = new Map(
    (values.allowed_scopes ?? []).map((row) => [
      row.entity?.uuid,
      row.entity?.name,
    ]),
  );
  const bindingLabels = template
    ? values.target && !staffAccess
      ? [getTargetLabel(values.target)]
      : []
    : bindings.map(
        (b) => `${entityNames.get(b.uuid) ?? b.uuid} (${labelForType(b.type)})`,
      );

  return (
    <WizardModal {...props}>
      <StepHeading
        title={translate('Review')}
        description={translate(
          'The token is shown once after it is created. Check what it can do before creating it.',
        )}
      />
      {missing.length > 0 && (
        <AlertItem
          type="floating"
          variant="error"
          title={translate('Some answers are missing')}
          body={missing.join(' ')}
          className="mb-3"
          data-testid="review-errors"
        />
      )}
      {staffAccess && <StaffAccessWarning />}
      <PropertyList variant="summary">
        <PropertyItem label={translate('Token name')} value={values.name} />
        <PropertyItem
          label={translate('Purpose')}
          value={template ? template.name : translate('Custom')}
        />
        {forAgentUser && values.target && (
          <PropertyItem
            label={translate('Token for')}
            value={translate(
              'new user {username}, offering manager of {offering}',
              {
                username:
                  values.agentUsername?.trim() ||
                  values.target.suggested_username ||
                  translate('derived from the offering'),
                offering: values.target.name,
              },
            )}
          />
        )}
        <PropertyItem
          label={translate('Restricted to')}
          value={propVal.list(bindingLabels, { display: 'stack' })}
          hideIfEmpty={false}
          placeholder={
            staffAccess
              ? translate('Not restricted (staff access)')
              : translate('Not restricted')
          }
        />
        <PropertyItem
          label={translate('Permissions')}
          value={propVal.list(scopes.map(getScopeLabel), {
            display: 'stack',
          })}
        />
        <PropertyItem
          label={translate('Expires')}
          value={propVal.date(values.expires_at)}
        />
        <PropertyItem
          label={translate('Allowed networks')}
          value={propVal.list(parseNetworks(values.allowed_networks))}
          hideIfEmpty={false}
          placeholder={translate('Any')}
        />
      </PropertyList>
      {!template && hasGlobalScope(scopes) && bindings.length === 0 && (
        <FormText variant="warning">
          {translate(
            'This token carries global staff or support access and is not restricted to any entity.',
          )}
        </FormText>
      )}
    </WizardModal>
  );
};

// Global access is named with its code too: it is the one to notice.
const getScopeLabel = (scope: string) =>
  scope === STAFF_ACCESS
    ? `${translate('Staff access')} (${STAFF_ACCESS})`
    : getPermissionLabel(scope);

const STEP_COMPONENTS: Record<TokenWizardStepKey, FC<WizardStepProps>> = {
  purpose: PurposeStep,
  target: TargetStep,
  permissions: PermissionsStep,
  limits: LimitsStep,
  review: ReviewStep,
};

/** The step shown is picked by key: which steps exist depends on the entry
 * point and on the templates the user can use. */
export const TokenWizardStep: FC<WizardStepProps> = (props) => {
  const key = props.steps[props.step]?.key as TokenWizardStepKey;
  const form = useForm<TokenWizardValues>();
  // Validation asks for the answers of the steps reached so far.
  useEffect(() => {
    form.change('step', key);
  }, [form, key]);
  const Component = STEP_COMPONENTS[key];
  return <Component {...props} />;
};
