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
  useRef,
  useState,
} from 'react';
import { Dropdown, Nav, Tab } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  Field,
  formValueSelector,
  getFormSyncErrors,
  InjectedFormProps,
} from 'redux-form';
import {
  ComponentUserUsage,
  marketplaceComponentUserUsagesList,
  marketplaceOfferingUsersList,
} from 'waldur-js-client';

import { parseDate } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { Tip } from '@waldur/core/Tooltip';
import { required } from '@waldur/core/validators';
import {
  FieldError,
  FormContainer,
  NumberField,
  SelectField,
  StringField,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { OfferingComponent } from '@waldur/marketplace/types';
import { HeaderButtonBullet } from '@waldur/navigation/header/HeaderButtonBullet';
import { type RootState } from '@waldur/store/reducers';

import { getPeriodRange } from './api';
import { UsageReportContext } from './types';
import { getBillingTypeLabel } from './utils';

export interface ResourceUsageFormProps extends InjectedFormProps {
  components: OfferingComponent[];
  periods: any;
  params: UsageReportContext;
  submitReport(): void;
  onPeriodChange(): void;
}

const SummaryField = ({ label, value }) => (
  <span>
    <strong className="text-gray-700">{label}</strong>: {value}
  </span>
);

const StaticPlanField: FunctionComponent = () => (
  <Field
    name="period"
    component={(fieldProps) => (
      <SummaryField
        label={translate('Period')}
        value={fieldProps.input.value.label}
      />
    )}
  />
);

export const ResourceUsageForm: FunctionComponent<ResourceUsageFormProps> = (
  props,
) => {
  const refNav = useRef(null);
  const [wrappedComponents, setWrappedComponents] = useState<
    OfferingComponent[]
  >([]);

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

  const errors = useSelector(
    (state: RootState) => getFormSyncErrors(props.form)(state) as any,
  );

  useEffect(() => {
    handleWindowResize();
  }, [errors]);

  const isUserUsage = props.params.userUsage;

  const user = useSelector((state) =>
    formValueSelector(props.form)(state, 'user'),
  );

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
              offering_uuid: props.params.offering_uuid,
              field: ['uuid', 'url', 'user_full_name', 'username'],
            },
          }).then((r) => r.data)
        : null,

    staleTime: 3 * 60 * 1000,
  });

  const { data: userUsages } = useQuery({
    queryKey: [
      'ComponentUserUsage',
      props.params.resource_uuid,
      user?.username,
    ],

    queryFn: () => {
      if (!isUserUsage || !user) return null;

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

  // Set last recorded user usages as components amount
  useEffect(() => {
    if (!userUsages?.length || !user) return;

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

      props.change(
        `components.${component.type}.amount`,
        recentUserRecord?.usage ?? 0,
      );
    });
  }, [userUsages, props.change, props.components, user]);

  const onChangeUser = (newUser) => {
    props.change('username', newUser?.username);
  };

  return (
    <form onSubmit={props.handleSubmit(props.submitReport)}>
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
          <FormContainer submitting={props.submitting}>
            <SelectField
              name="period"
              label={translate('Plan')}
              tooltip={translate(
                'Each usage report must be connected with a billing plan to assure correct calculation of accounting data.',
              )}
              options={props.periods}
              onChange={props.onPeriodChange}
              isClearable={false}
            />
          </FormContainer>
        ) : (
          <StaticPlanField />
        )}
      </div>
      {/* Render User and Username for User usage report */}
      <div className="text-gray-500 mb-4">
        {isUserUsage && (
          <FormContainer submitting={props.submitting}>
            {teamError ? (
              <LoadingErred loadData={refetchTeam} />
            ) : (
              <SelectField
                name="user"
                label={translate('User')}
                options={team}
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.user_full_name}
                onChange={onChangeUser}
                isLoading={teamIsLoading}
                isClearable
                placeholder={translate('Select team member')}
              />
            )}
            <StringField
              name="username"
              label={translate('Username')}
              placeholder={translate('Enter username(s)')}
              required={true}
              validate={required}
              readOnly={Boolean(user)}
            />
          </FormContainer>
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
                      variant="active-light-primary"
                      className="btn-icon btn-text-gray-500 no-arrow w-35px h-35px"
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
                              <QuestionIcon size={18} className="ms-1" />
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
                <FormContainer submitting={props.submitting} space={4}>
                  <NumberField
                    name={`components.${component.type}.amount`}
                    key={`${component.uuid}.amount`}
                    hideLabel
                    description={component.description}
                    unit={component.measured_unit}
                    max={
                      component.limit_period
                        ? component.limit_amount
                        : undefined
                    }
                    required={true}
                    validate={required}
                    placeholder={translate('Amount') + ' *'}
                  />

                  <TextField
                    name={`components.${component.type}.description`}
                    key={`${component.uuid}.description`}
                    placeholder={translate('Enter a description') + '...'}
                    hideLabel
                    rows={3}
                  />

                  <AwesomeCheckboxField
                    name={`components.${component.type}.recurring`}
                    key={`${component.uuid}.recurring`}
                    label={translate(
                      'Reported value is reused every month until changed.',
                    )}
                    hideLabel
                    spaceless
                  />
                </FormContainer>
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      )}
    </form>
  );
};
