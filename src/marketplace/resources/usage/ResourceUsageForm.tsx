import { DotsThreeIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field, useField, useForm } from 'react-final-form';
import {
  ComponentUserUsage,
  marketplaceComponentUserUsagesList,
  marketplaceOfferingUsersList,
  ResourcePlanPeriod,
  OfferingComponent,
} from 'waldur-js-client';

import {
  BaseButton,
  HelpIcon,
  Menu,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
} from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { parseDate } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { required } from '@/core/validators';
import {
  FieldError,
  NumberField,
  TextField,
  SelectGroup,
  StringGroup,
} from '@/form';
import { RadioGroupField } from '@/form/RadioGroupField';
import { translate } from '@/i18n';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';

import { getPeriodRange } from './api';
import {
  getMissingUsagePolicyChoices,
  MISSING_USAGE_POLICY_DEFAULT,
} from './missingUsagePolicy';
import { UsageReportContext } from './types';
import { getBillingTypeLabelOrDash } from './utils';

interface Period {
  label: string;
  value: ResourcePlanPeriod | null;
}

interface ResourceUsageFormProps {
  components: OfferingComponent[];
  periods: Period[];
  params: UsageReportContext;
}

interface SummaryFieldProps {
  label: string;
  value: string;
}

const SummaryField: React.FC<SummaryFieldProps> = ({ label, value }) => (
  <span>
    <strong className="text-gray-700">{label}</strong>: {value}
  </span>
);

const StaticPlanField: FunctionComponent = () => {
  const { input } = useField('period');
  return (
    <SummaryField label={translate('Period')} value={input.value?.label} />
  );
};

export const ResourceUsageForm: FunctionComponent<ResourceUsageFormProps> = (
  props,
) => {
  const refNav = useRef(null);
  const [wrappedComponents, setWrappedComponents] = useState<
    OfferingComponent[]
  >([]);
  const form = useForm();
  const formState = form.getState();
  const errors = formState.errors || {};
  // Controlled so the overflow menu, which sits outside the tab Nav, can
  // switch tabs too.
  const [activeTab, setActiveTab] = useState(props.components[0]?.uuid);
  const [promotedTab, setPromotedTab] = useState<string>();

  // A component picked from the overflow goes first, so the tab row always
  // names the component being edited, even when only one tab fits.
  const orderedComponents = useMemo(() => {
    const promoted = props.components.find((c) => c.uuid === promotedTab);
    return promoted
      ? [promoted, ...props.components.filter((c) => c !== promoted)]
      : props.components;
  }, [props.components, promotedTab]);

  const selectTab = (uuid: string | null) => {
    // Promotion is recorded on pick rather than derived from the measurement:
    // once promoted the tab no longer wraps, and a derived flag would drop it
    // back into the overflow on the next measure.
    if (wrappedComponents.some((c) => c.uuid === uuid)) {
      setPromotedTab(uuid);
    }
    setActiveTab(uuid);
  };

  const measureWrappedComponents = useCallback(() => {
    if (!refNav?.current) return;
    const tabs = Array.from<HTMLElement>(refNav.current.children);
    const wrappedItems = [];
    if (!tabs?.length) return;
    const firstTab = tabs[0].getBoundingClientRect();
    for (let i = 0; i < tabs.length; i++) {
      const currItem = tabs[i].getBoundingClientRect();
      if (firstTab && firstTab.top < currItem.top) {
        if (orderedComponents[i]) {
          wrappedItems.push(orderedComponents[i]);
        }
      }
    }
    setWrappedComponents(wrappedItems);
  }, [orderedComponents]);

  const handleWindowResize = useMemo(
    () => debounce(measureWrappedComponents, 100),
    [measureWrappedComponents],
  );

  // Before paint, so a reordered row never flashes with the promoted tab
  // collapsed and the displaced one spilling onto a second line.
  useLayoutEffect(measureWrappedComponents, [measureWrappedComponents]);

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      handleWindowResize.cancel();
    };
  }, [handleWindowResize]);

  useEffect(() => {
    handleWindowResize();
  }, [errors]);

  const isUserUsage = props.params.userUsage;
  const { input: userInput } = useField('user');
  const user = userInput.value;

  const {
    data: team,
    isLoading: teamIsLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['OfferingUsers', props.params.offering_uuid],

    queryFn: () =>
      isUserUsage
        ? marketplaceOfferingUsersList({
            query: {
              offering_uuid: [props.params.offering_uuid],
              field: ['uuid', 'url', 'user_full_name', 'username'],
            },
          }).then((r) => r.data)
        : null,

    staleTime: UI_STALE_TIME,
  });

  const { data: userUsages } = useQuery({
    queryKey: [
      'ComponentUserUsage',
      props.params.resource_uuid,
      user?.username,
    ],

    queryFn: () => {
      if (!isUserUsage || !user || !props.periods[0].value) return null;

      const { start, end } = getPeriodRange(props.periods[0].value);
      return marketplaceComponentUserUsagesList({
        query: {
          resource_uuid: props.params.resource_uuid,
          ...(end
            ? { date_after: start.toISODate(), date_before: end.toISODate() }
            : { date_after: start.toISODate() }),
          field: ['uuid', 'usage', 'user', 'component_type', 'modified'],
        },
      }).then((r) => r.data);
    },
  });

  // Memoize the user usages processing for performance
  const processedUserUsages = useMemo(() => {
    if (!userUsages?.length || !user) return {};

    const usagesByComponentType: Record<string, number> = {};

    props.components.forEach((component) => {
      let recentUserRecord: Pick<
        ComponentUserUsage,
        'usage' | 'component_type' | 'uuid' | 'modified' | 'user'
      >;
      userUsages.forEach((record) => {
        if (
          record.user === user.url &&
          component.type === record.component_type
        ) {
          if (!recentUserRecord) recentUserRecord = record;
          else if (
            parseDate(record.modified).toMillis() >
            parseDate(recentUserRecord.modified).toMillis()
          ) {
            recentUserRecord = record;
          }
        }
      });

      usagesByComponentType[component.type] = recentUserRecord?.usage ?? 0;
    });

    return usagesByComponentType;
  }, [userUsages, user, props.components]);

  // Set last recorded user usages as components amount
  useEffect(() => {
    if (Object.keys(processedUserUsages).length === 0) return;

    Object.entries(processedUserUsages).forEach(([componentType, usage]) => {
      form.change(`components.${componentType}.amount`, usage);
    });
  }, [processedUserUsages, form]);

  const onChangeUser = (newUser) => {
    form.change('username', newUser?.username);
  };

  return (
    <div>
      <div className="text-gray-500 mb-4">
        <SummaryField
          label={translate('Client organization')}
          value={props.params.customer_name}
        />
        ,{' '}
        <SummaryField
          label={translate('Client project')}
          value={props.params.project_name}
        />
        ,{' '}
        {props.params.backend_id && (
          <>
            <SummaryField
              label={translate('Backend ID')}
              value={props.params.backend_id}
            />
            ,{' '}
          </>
        )}
        {props.periods.length > 1 ? (
          <SelectGroup
            name="period"
            options={props.periods}
            onChange={(value) => {
              const period = value;
              if (period?.value?.components) {
                for (const component of period.value.components) {
                  form.change(
                    `components.${component.type}.amount`,
                    component.usage,
                  );
                  form.change(
                    `components.${component.type}.description`,
                    component.description,
                  );
                }
              }
              return value;
            }}
            isClearable={false}
            label={translate('Plan')}
            help={translate(
              'Each usage report must be connected with a billing plan to assure correct calculation of accounting data.',
            )}
          />
        ) : (
          <StaticPlanField />
        )}
      </div>
      {/* Render User and Username for User usage report */}
      <div className="text-gray-500 mb-4">
        {isUserUsage && (
          <>
            {teamError ? (
              <LoadingErred loadData={refetchTeam} />
            ) : (
              <SelectGroup
                name="user"
                options={team}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.user_full_name}
                onChange={onChangeUser}
                isLoading={teamIsLoading}
                isClearable
                placeholder={translate('Select team member')}
                label={translate('User')}
              />
            )}
            <StringGroup
              name="username"
              placeholder={translate('Enter username(s)')}
              validate={required}
              readOnly={Boolean(user)}
              label={translate('Username')}
              required
            />
          </>
        )}
      </div>
      {props.components.length > 0 && (
        <Tabs mount="all" value={activeTab} onValueChange={selectTab}>
          <div className="d-flex">
            <TabsList ref={refNav} className="flex-wrap flex-grow-1 mb-4">
              {orderedComponents.map((component) => {
                const isHidden = wrappedComponents.some(
                  (c) => component.uuid === c.uuid,
                );
                return (
                  <TabsTrigger
                    key={component.uuid}
                    value={component.uuid}
                    hint={
                      isHidden
                        ? undefined
                        : getBillingTypeLabelOrDash(component.billing_type)
                    }
                    className={
                      isHidden
                        ? 'invisible h-0 overflow-hidden !p-0 border-0'
                        : undefined
                    }
                  >
                    {Boolean(errors.components?.[component.type]) && (
                      <Tooltip
                        label={
                          isHidden ? null : (
                            <FieldError
                              error={errors.components[component.type]}
                            />
                          )
                        }
                        autoWidth
                      >
                        <WarningCircleIcon
                          size={18}
                          weight="bold"
                          className="text-danger me-1"
                        />
                      </Tooltip>
                    )}
                    {component.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {wrappedComponents.length > 0 ? (
              <div className="d-flex align-items-end border-bottom mb-4">
                <div>
                  <Menu>
                    <div className="position-relative d-inline-flex">
                      <Menu.Trigger asChild>
                        <BaseButton
                          variant="text-secondary"
                          size="md"
                          iconNode={<DotsThreeIcon size={22} weight="bold" />}
                        />
                      </Menu.Trigger>
                      {wrappedComponents.some((comp) =>
                        Boolean(errors.components?.[comp.type]),
                      ) && (
                        <HeaderButtonBullet
                          size={10}
                          blink={false}
                          variant="danger"
                          className="me-n2"
                        />
                      )}
                    </div>
                    <Menu.Content look="actions">
                      <div className="mh-200px overflow-auto">
                        {wrappedComponents.map((component) => (
                          <Menu.Item
                            key={component.uuid}
                            className="d-flex justify-content-between"
                            onClick={() => selectTab(component.uuid)}
                          >
                            {Boolean(errors.components?.[component.type]) && (
                              <Tooltip
                                label={
                                  <FieldError
                                    error={errors.components[component.type]}
                                  />
                                }
                                autoWidth
                              >
                                <WarningCircleIcon
                                  size={18}
                                  weight="bold"
                                  className="text-danger me-1"
                                />
                              </Tooltip>
                            )}
                            {component.name}
                            <HelpIcon
                              label={getBillingTypeLabelOrDash(
                                component.billing_type,
                              )}
                              size={18}
                              className="ms-1"
                            />
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Content>
                  </Menu>
                </div>
              </div>
            ) : (
              <div className="w-35px" />
            )}
          </div>
          <>
            {props.components.map((component) => (
              <TabsContent key={component.uuid} value={component.uuid}>
                <div>
                  <div className="mb-7">
                    {component.description && (
                      <div
                        id={`${component.type}-description`}
                        className="text-muted mb-2"
                      >
                        {component.description}
                      </div>
                    )}
                    <Field
                      name={`components.${component.type}.amount`}
                      validate={required}
                    >
                      {({ input, meta }) => (
                        <NumberField
                          input={input}
                          meta={meta}
                          unit={component.measured_unit}
                          max={
                            component.limit_period
                              ? component.limit_amount
                              : undefined
                          }
                          placeholder={translate('Amount *')}
                          aria-label={translate('{amount} for {name}', {
                            amount: translate('Amount'),
                            name: component.name,
                          })}
                          aria-describedby={`${component.type}-description`}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="mb-7">
                    <Field name={`components.${component.type}.description`}>
                      {({ input, meta }) => (
                        <TextField
                          input={input}
                          meta={meta}
                          placeholder={translate('Enter a description...')}
                          rows={3}
                          aria-label={translate('{description} for {name}', {
                            description: translate('Description'),
                            name: component.name,
                          })}
                        />
                      )}
                    </Field>
                  </div>

                  {/* The policy belongs to the total usage record; the
                      per-user endpoint neither accepts nor stores it. */}
                  {!isUserUsage && (
                    <Field
                      name={`components.${component.type}.missing_usage_policy`}
                      // A component with no usage record for the period has no
                      // entry in initialValues; without this the radio group
                      // renders with nothing selected.
                      defaultValue={MISSING_USAGE_POLICY_DEFAULT}
                    >
                      {({ input }) => (
                        <RadioGroupField
                          input={input}
                          label={translate(
                            'When no usage is reported for the next month',
                          )}
                          choices={getMissingUsagePolicyChoices()}
                        />
                      )}
                    </Field>
                  )}
                </div>
              </TabsContent>
            ))}
          </>
        </Tabs>
      )}
    </div>
  );
};
