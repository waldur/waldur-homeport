import {
  DotsThreeIcon,
  QuestionIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash-es';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Dropdown, Nav, Tab } from 'react-bootstrap';
import { Field, useField, useForm } from 'react-final-form';
import {
  ComponentUserUsage,
  marketplaceComponentUserUsagesList,
  marketplaceOfferingUsersList,
  type ResourcePlanPeriod,
} from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { parseDate } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import {
  FieldError,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { OfferingComponent } from '@/marketplace/types';
import { HeaderButtonBullet } from '@/navigation/header/HeaderButtonBullet';

import { getPeriodRange } from './api';
import { UsageReportContext } from './types';
import { getBillingTypeLabel } from './utils';

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

  const handleWindowResize = useCallback(
    debounce(() => {
      if (!refNav?.current) return;
      const tabs = Array.from<HTMLElement>(refNav.current.children);
      const wrappedItems = [];
      if (!tabs?.length) return;
      const firstTab = tabs[0].getBoundingClientRect();
      for (let i = 0; i < tabs.length; i++) {
        const currItem = tabs[i].getBoundingClientRect();
        if (firstTab && firstTab.top < currItem.top) {
          if (props.components[i]) {
            wrappedItems.push(props.components[i]);
          }
        }
      }
      setWrappedComponents(wrappedItems);
    }, 100),
    [refNav?.current, props.components],
  );

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    handleWindowResize();
    return () => {
      window.removeEventListener('resize', handleWindowResize);
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
      let recentUserRecord: ComponentUserUsage;
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
          <FormGroup
            label={translate('Plan')}
            help={translate(
              'Each usage report must be connected with a billing plan to assure correct calculation of accounting data.',
            )}
          >
            <Field
              component={SelectField}
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
            />
          </FormGroup>
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
              <FormGroup label={translate('User')}>
                <Field
                  component={SelectField}
                  name="user"
                  options={team}
                  getOptionValue={(option) => option.uuid}
                  getOptionLabel={(option) => option.user_full_name}
                  onChange={onChangeUser}
                  isLoading={teamIsLoading}
                  isClearable
                  placeholder={translate('Select team member')}
                />
              </FormGroup>
            )}
            <FormGroup label={translate('Username')} required>
              <Field
                component={StringField}
                name="username"
                placeholder={translate('Enter username(s)')}
                validate={required}
                readOnly={Boolean(user)}
              />
            </FormGroup>
          </>
        )}
      </div>
      {props.components.length > 0 && (
        <Tab.Container defaultActiveKey={props.components[0].uuid}>
          <div className="d-flex">
            <Nav
              ref={refNav}
              variant="tabs"
              className="nav-line-tabs flex-grow-1 mb-4"
            >
              {props.components.map((component) => {
                const isHidden = wrappedComponents.some(
                  (c) => component.uuid === c.uuid,
                );
                return (
                  <Nav.Item key={component.uuid} className={isHidden && 'h-0'}>
                    <Nav.Link eventKey={component.uuid}>
                      {Boolean(errors.components?.[component.type]) && (
                        <Tip
                          id={`tip-${component.uuid}-error`}
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
                        </Tip>
                      )}
                      {component.name}
                      <Tip
                        id={`tip-${component.uuid}-type`}
                        label={
                          isHidden
                            ? null
                            : getBillingTypeLabel(component.billing_type)
                        }
                      >
                        <QuestionIcon
                          size={18}
                          weight="bold"
                          className="ms-1"
                        />
                      </Tip>
                    </Nav.Link>
                  </Nav.Item>
                );
              })}
            </Nav>
            {wrappedComponents.length > 0 ? (
              <Nav variant="tabs" className="nav-line-tabs mb-4">
                <Nav.Item>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="text-secondary"
                      className="btn-icon no-arrow w-35px h-35px"
                    >
                      <DotsThreeIcon size={22} weight="bold" />
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
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <div className="mh-200px overflow-auto">
                        {wrappedComponents.map((component) => (
                          <Dropdown.Item
                            key={component.uuid}
                            eventKey={component.uuid}
                            className="d-flex justify-content-between"
                          >
                            {Boolean(errors.components?.[component.type]) && (
                              <Tip
                                id={`tip-${component.uuid}-error`}
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
                              </Tip>
                            )}
                            {component.name}
                            <Tip
                              id={`tip-${component.uuid}-type`}
                              label={getBillingTypeLabel(
                                component.billing_type,
                              )}
                            >
                              <QuestionIcon
                                size={18}
                                className="ms-1"
                                weight="bold"
                              />
                            </Tip>
                          </Dropdown.Item>
                        ))}
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </Nav.Item>
              </Nav>
            ) : (
              <div className="w-35px" />
            )}
          </div>
          <Tab.Content>
            {props.components.map((component) => (
              <Tab.Pane key={component.uuid} eventKey={component.uuid}>
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
                      component={NumberField}
                      name={`components.${component.type}.amount`}
                      unit={component.measured_unit}
                      max={
                        component.limit_period
                          ? component.limit_amount
                          : undefined
                      }
                      validate={required}
                      placeholder={translate('Amount *')}
                      aria-label={translate('{amount} for {name}', {
                        amount: translate('Amount'),
                        name: component.name,
                      })}
                      aria-describedby={`${component.type}-description`}
                    />
                  </div>

                  <div className="mb-7">
                    <Field
                      component={TextField}
                      name={`components.${component.type}.description`}
                      placeholder={translate('Enter a description...')}
                      rows={3}
                      aria-label={translate('{description} for {name}', {
                        description: translate('Description'),
                        name: component.name,
                      })}
                    />
                  </div>

                  <Field
                    component={AwesomeCheckboxField}
                    name={`components.${component.type}.recurring`}
                    label={translate(
                      'Reported value is reused every month until changed.',
                    )}
                  />
                </div>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      )}
    </div>
  );
};
