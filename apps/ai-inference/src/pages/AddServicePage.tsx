import { CheckIcon } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  marketplaceOrdersCreate,
  Project,
  PublicOfferingDetails,
} from 'waldur-js-client';
import { showSuccess } from 'waldur-notifications';
import { useManagedMutation } from 'waldur-shell';
import {
  Badge,
  BaseButton,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  FormField,
  FormLabel,
  FormText,
  Input,
  InputGroup,
  LoadingSpinner,
} from 'waldur-ui';

import { Chip, PAGE_CLASS, PageHeader, ServiceMark } from '../components';
import { periodLabel } from '../format';
import { useInferenceOfferings, useServices } from '../queries';
import { navigate, sectionHref } from '../router';
import {
  LimitPeriod,
  limitError,
  limitsPayload,
  offeredModels,
  serviceLimitFields,
  suggestServiceName,
} from '../services';

const OfferingCard = ({
  offering,
  inProject,
  selected,
  onSelect,
}: {
  offering: PublicOfferingDetails;
  inProject: boolean;
  selected: boolean;
  onSelect: () => void;
}) => {
  const models = offeredModels(offering.resource_options);
  return (
    // The same block as a service on the overview: one card, no divider.
    <Card className={selected ? 'outline-2 outline-brand' : undefined}>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <ServiceMark name={offering.name} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-primary">
                {offering.name}
              </span>
              <span className="truncate text-xs text-tertiary">
                {offering.customer_name}
              </span>
            </div>
          </div>
          {inProject ? (
            <Badge variant="neutral" shape="pill" className="shrink-0">
              {translate('In this project')}
            </Badge>
          ) : null}
        </div>
        {offering.description ? (
          <p className="line-clamp-3 text-sm text-secondary">
            {offering.description}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          <Chip>
            {models
              ? translate('{count} models', { count: models.length })
              : translate('Models listed at the endpoint')}
          </Chip>
        </div>
        <div className="mt-auto">
          <BaseButton
            variant={selected ? 'primary' : 'tertiary'}
            className="w-full"
            iconNode={selected ? <CheckIcon weight="bold" /> : undefined}
            label={selected ? translate('Chosen') : translate('Choose')}
            onClick={onSelect}
          />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * What the order form asks of someone who wants a service: its spending
 * limits for the project and a name for the invoice. The plan (one per
 * inference offering) and the terms are taken as given.
 */
const RequestForm = ({
  project,
  offering,
}: {
  project: Project;
  offering: PublicOfferingDetails;
}) => {
  const fields = useMemo(
    () => serviceLimitFields(offering.components),
    [offering],
  );
  const [amounts, setAmounts] = useState<Partial<Record<LimitPeriod, string>>>(
    () =>
      Object.fromEntries(
        fields
          .filter((field) => field.default != null)
          .map((field) => [field.period, String(field.default)]),
      ),
  );
  const [name, setName] = useState(() =>
    suggestServiceName(offering.name, project.name),
  );
  const plan = offering.plans?.[0];
  const errors = Object.fromEntries(
    fields.map((field) => [
      field.period,
      limitError(amounts[field.period], field.maximum),
    ]),
  );
  const invalid = Object.values(errors).some(Boolean) || !name.trim();

  const request = useManagedMutation({
    mutationFn: () =>
      marketplaceOrdersCreate({
        body: {
          offering: offering.url,
          project: project.url,
          plan: plan.url,
          attributes: { name: name.trim() },
          spending_limits: limitsPayload(amounts),
          accepting_terms_of_service: true,
        },
      }),
    closeModal: false,
    errorMessage: translate('Could not request the service.'),
    // Say what actually happened: the order's state is the backend's answer.
    onSuccess: (response) => {
      const waiting = response.data?.state === 'pending-consumer';
      showSuccess(
        translate('{name} requested', { name: offering.name }),
        waiting
          ? translate(
              'It waits for approval in your organisation first; then the provider sets it up.',
            )
          : translate('The provider sets it up; it shows on Overview.'),
      );
      navigate(sectionHref(project.uuid, 'overview'));
    },
  });

  if (!plan) {
    return (
      <EmptyState
        title={translate('This service cannot be requested here')}
        message={translate(
          'It has no plan to order. Ask its provider, or request it in the portal.',
        )}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {translate('Request {name}', { name: offering.name })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {fields.length ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              {translate('What the project may spend')}
            </span>
            <FormText>
              {translate(
                'Access pauses for the whole project when a limit is reached and resumes when it resets. Leave a period empty for no limit.',
              )}
            </FormText>
            <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-3">
              {fields.map((field) => (
                <FormField
                  key={field.period}
                  controlId={`service-limit-${field.period}`}
                >
                  <FormLabel>{periodLabel(field.period)}</FormLabel>
                  <InputGroup invalid={!!errors[field.period]}>
                    <Input
                      id={`service-limit-${field.period}`}
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
        <FormField controlId="service-name">
          <FormLabel>{translate('Name on invoices')}</FormLabel>
          <Input
            id="service-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>
        <FormText>
          {translate(
            'You pay for what the keys use, at the prices the provider sets. Nothing is charged while nobody uses it.',
          )}
        </FormText>
      </CardContent>
      <CardFooter className="justify-end">
        <BaseButton
          variant="primary"
          label={translate('Request {name}', { name: offering.name })}
          pending={request.isPending}
          disabled={invalid || request.isPending}
          tooltip={
            invalid ? translate('Correct the limits and the name.') : undefined
          }
          onClick={() => request.mutate(undefined)}
        />
      </CardFooter>
    </Card>
  );
};

export const AddServicePage = ({ project }: { project: Project }) => {
  const offerings = useInferenceOfferings();
  const services = useServices(project.uuid);
  const [selectedUuid, setSelectedUuid] = useState<string>();
  const selected = offerings.data?.find((o) => o.uuid === selectedUuid);
  const ordered = new Set(
    (services.data ?? []).map((service) => service.offering_uuid),
  );

  return (
    <div className={PAGE_CLASS}>
      <PageHeader
        project={project}
        title={translate('Add a service')}
        description={translate(
          'Choose an inference service for this project. Once it is set up, its people can be given keys.',
        )}
      />
      {offerings.isLoading ? (
        <LoadingSpinner />
      ) : !offerings.data?.length ? (
        <Card>
          <CardContent>
            <EmptyState
              title={translate('No inference service is offered yet')}
              message={translate(
                'Providers publish them in the marketplace. Ask your organisation which ones you can use.',
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {offerings.data.map((offering) => (
              <OfferingCard
                key={offering.uuid}
                offering={offering}
                inProject={ordered.has(offering.uuid)}
                selected={offering.uuid === selectedUuid}
                onSelect={() => setSelectedUuid(offering.uuid)}
              />
            ))}
          </div>
          {selected ? (
            <RequestForm
              key={selected.uuid}
              project={project}
              offering={selected}
            />
          ) : null}
        </>
      )}
    </div>
  );
};
