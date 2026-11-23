import { useEffect, useMemo, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { marketplaceResourceApiKeysCreate, Project } from 'waldur-js-client';
import { useManagedMutation } from 'waldur-shell';
import {
  BaseButton,
  Checkbox,
  CloseDialogButton,
  FormField,
  FormLabel,
  FormText,
  Input,
  InputGroup,
  ModalDialog,
  ModalShell,
  NativeSelect,
  RadioGroup,
} from 'waldur-ui';

import { periodLabel } from './format';
import { useProjectUsers } from './queries';
import {
  ALL_MODELS,
  keyLimitFields,
  LimitPeriod,
  limitError,
  limitsPayload,
} from './services';
import { InferenceService } from './useInferenceData';

const SHARED = '';

/**
 * A manager issues a key: on one service, for one person or shared, with
 * its models and spending limits. Waldur records the request and the
 * provider creates the key; it shows as Being created until then.
 */
const IssueKeyForm = ({
  project,
  services,
  onDone,
}: {
  project: Project;
  services: InferenceService[];
  onDone: () => void;
}) => {
  const [serviceUuid, setServiceUuid] = useState(services[0]?.resource.uuid);
  const service = services.find((s) => s.resource.uuid === serviceUuid);
  const users = useProjectUsers(project, true);
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(SHARED);
  const [modelChoice, setModelChoice] = useState<'all' | 'pick'>('all');
  const [picked, setPicked] = useState<string[]>([]);
  const [amounts, setAmounts] = useState<Partial<Record<LimitPeriod, string>>>(
    {},
  );
  // The backend allows a person one key per service: whoever holds one
  // here cannot be given another.
  const holders = useMemo(
    () =>
      new Set(
        (service?.keys ?? [])
          .map((key) => key.user_uuid)
          .filter((uuid): uuid is string => !!uuid),
      ),
    [service],
  );
  // A person with several roles in the project is listed once.
  const people = useMemo(
    () => [
      ...new Map(
        (users.data ?? []).map((user) => [user.user_uuid, user]),
      ).values(),
    ],
    [users.data],
  );

  const limitFields = useMemo(
    () =>
      service?.offering
        ? keyLimitFields(
            service.offering,
            service.resource.spending_limits as Record<
              string,
              Record<string, number>
            >,
          )
        : [],
    [service],
  );
  // Another service lists other models and other limits, and other people
  // may hold a key on it.
  useEffect(() => {
    setPicked([]);
    setAmounts({});
    setAssignee(SHARED);
  }, [serviceUuid]);

  const errors = Object.fromEntries(
    limitFields.map((field) => [
      field.period,
      limitError(amounts[field.period], field.maximum),
    ]),
  );
  const invalid =
    Object.values(errors).some(Boolean) ||
    (modelChoice === 'pick' && !picked.length);

  const issue = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysCreate({
        body: {
          resource: serviceUuid,
          description: description.trim(),
          user: assignee || null,
          allowed_models: modelChoice === 'all' ? [ALL_MODELS] : picked,
          spending_limits: limitsPayload(amounts),
        },
      }),
    successMessage: translate('Key requested'),
    successDescription: translate(
      'The service creates it, usually within a minute. It can be revealed once it is active.',
    ),
    errorMessage: translate('Could not issue the key.'),
    onSuccess: onDone,
  });

  const disabledReason = invalid
    ? modelChoice === 'pick' && !picked.length
      ? translate('Pick at least one model.')
      : translate('Correct the limits first.')
    : undefined;

  return (
    <ModalDialog
      title={translate('Issue a key')}
      subtitle={project.name}
      footer={
        <>
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            label={translate('Issue key')}
            pending={issue.isPending}
            disabled={invalid || issue.isPending}
            tooltip={disabledReason}
            onClick={() => issue.mutate(undefined)}
          />
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {services.length > 1 ? (
          <FormField controlId="key-service">
            <FormLabel>{translate('Service')}</FormLabel>
            <NativeSelect
              id="key-service"
              value={serviceUuid}
              onChange={(event) => setServiceUuid(event.target.value)}
            >
              {services.map((item) => (
                <option key={item.resource.uuid} value={item.resource.uuid}>
                  {item.resource.offering_name}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        ) : null}
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
          <FormField controlId="key-description">
            <FormLabel>{translate('What is it for?')}</FormLabel>
            <Input
              id="key-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={translate('e.g. notebook-dev')}
            />
          </FormField>
          <FormField controlId="key-assignee">
            <FormLabel>{translate('Assign to')}</FormLabel>
            <NativeSelect
              id="key-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            >
              <option value={SHARED}>
                {translate('No one: a shared key')}
              </option>
              {people.map((user) => (
                <option
                  key={user.user_uuid}
                  value={user.user_uuid}
                  disabled={holders.has(user.user_uuid)}
                >
                  {holders.has(user.user_uuid)
                    ? translate('{name} (has a key here)', {
                        name: user.user_full_name || user.user_username,
                      })
                    : user.user_full_name || user.user_username}
                </option>
              ))}
            </NativeSelect>
            <FormText>
              {assignee
                ? translate('Only they can reveal it.')
                : translate(
                    'Everyone whose role allows it can reveal a shared key.',
                  )}{' '}
              {holders.size
                ? translate('A person holds at most one key per service.')
                : null}
            </FormText>
          </FormField>
        </div>
        <RadioGroup
          label={translate('Models')}
          value={modelChoice}
          onValueChange={(value) => setModelChoice(value as 'all' | 'pick')}
          options={[
            {
              value: 'all',
              label: translate('Every model the service lists'),
              description: translate('Including ones it adds later.'),
            },
            {
              value: 'pick',
              label: translate('These models'),
              disabled: !service?.models?.length,
            },
          ]}
        />
        {modelChoice === 'pick' && service?.models?.length ? (
          <div className="grid grid-cols-1 gap-2 ps-7 sm:grid-cols-2">
            {service.models.map((model) => (
              <Checkbox
                key={model}
                label={model}
                checked={picked.includes(model)}
                onCheckedChange={(checked) =>
                  setPicked((current) =>
                    checked
                      ? [...current, model]
                      : current.filter((name) => name !== model),
                  )
                }
              />
            ))}
          </div>
        ) : null}
        {limitFields.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {translate('Spending limits')}
            </span>
            <FormText>
              {translate(
                'The key pauses at a limit and resumes by itself when it resets. Leave a period empty for no limit.',
              )}
            </FormText>
            <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-3">
              {limitFields.map((field) => (
                <FormField
                  key={field.period}
                  controlId={`key-limit-${field.period}`}
                >
                  <FormLabel>{periodLabel(field.period)}</FormLabel>
                  <InputGroup invalid={!!errors[field.period]}>
                    <Input
                      id={`key-limit-${field.period}`}
                      inputMode="decimal"
                      value={amounts[field.period] ?? ''}
                      onChange={(event) =>
                        setAmounts((current) => ({
                          ...current,
                          [field.period]: event.target.value,
                        }))
                      }
                      placeholder={translate('No limit')}
                    />
                  </InputGroup>
                  <FormText>
                    {errors[field.period] ??
                      (field.maximum != null
                        ? translate('Up to {maximum}', {
                            maximum: field.maximum,
                          })
                        : undefined)}
                  </FormText>
                </FormField>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ModalDialog>
  );
};

export const IssueKeyDialog = ({
  open,
  project,
  services,
  onClose,
}: {
  open: boolean;
  project: Project;
  services: InferenceService[];
  onClose: () => void;
}) => (
  <ModalShell open={open} onHide={onClose} size="lg">
    {open ? (
      <IssueKeyForm project={project} services={services} onDone={onClose} />
    ) : null}
  </ModalShell>
);
