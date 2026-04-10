import { get } from 'lodash-es';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { OrderDetails } from 'waldur-js-client';

import { parseDate } from '@waldur/core/dateUtils';
import { getInitialValues, syncFiltersToURL } from '@waldur/core/filters';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getCustomer } from '@waldur/customer/utils';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { Offering, Plan } from '@waldur/marketplace/types';
import { calculateSystemVolumeSize } from '@waldur/openstack/openstack-instance/utils';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermissionOnAnyScope } from '@waldur/permissions/hasPermission';
import { MARKETPLACE_RANCHER } from '@waldur/rancher/cluster/create/constants';
import { useUser } from '@waldur/workspace/hooks';
import {
  getProject as currentProjectSelector,
  getCustomer as currentCustomerSelector,
} from '@waldur/workspace/selectors';

import { getOrderFormComponent } from '../common/registry';
import { DeployFormData, Limits } from '../common/types';
import { PageBarProvider } from '../context';
import { ORDER_FORM_ID } from '../details/constants';
import { getMarketplaceFilters } from '../landing/filter/store/selectors';
import { getDefaultLimits } from '../offerings/utils';
import { isExperimentalUiComponentsVisible } from '../utils';

import { DeployForm } from './DeployForm';
import { DeployPageActions } from './DeployPageActions';
import { DeployPageSidebar } from './DeployPageSidebar';
import { resolveCustomer, resolveProject } from './initUtils';
import { orderFormDataSelector } from './selectors';
import { orderCustomerSelector } from './selectors';
import { orderProjectSelector } from './selectors';
import { OfferingConfigurationFormStep } from './types';
import { hasStepWithField } from './utils';

import './DeployPage.scss';

interface DeployPageProps {
  offering: Offering;
  limits?: Limits;
  previewMode?: boolean;
}

interface BaseDeployPageProps
  extends Partial<InjectedFormProps>, DeployPageProps {
  order?: OrderDetails;
  formData: DeployFormData;
  selectedOffering: Offering;
  inputFormSteps: OfferingConfigurationFormStep[];
  initialLimits?: Limits;
  plan?: Plan;
  updateMode?: boolean;
}

export const BaseDeployPage = ({
  formData,
  inputFormSteps,
  selectedOffering,
  ...props
}: BaseDeployPageProps) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const marketplaceFilters = useSelector(getMarketplaceFilters);

  const isEdit = useMemo(() => Boolean(props.order), [props]);

  const user = useUser();
  const customer = useSelector(orderCustomerSelector);
  const project = useSelector(orderProjectSelector);

  const currentCustomer = useSelector(currentCustomerSelector);
  const currentProject = useSelector(currentProjectSelector);

  const isProjectInactive = useMemo(() => {
    if (project?.end_date) {
      const endDate = parseDate(project?.end_date);
      const now = parseDate(null);
      return endDate.hasSame(now, 'day') || endDate < now;
    }
    return false;
  }, [project]);

  const noOrganizationOrProject = !customer || !project;
  const canCreateOrder = hasPermissionOnAnyScope(
    user,
    PermissionEnum.CREATE_ORDER,
  );

  const plans = useMemo(
    () => selectedOffering.plans.filter((plan) => plan.archived === false),
    [selectedOffering],
  );

  const formSteps = useMemo(
    () =>
      inputFormSteps
        .filter(
          (step) => (step.isActive && step.isActive(selectedOffering)) ?? true,
        )
        .map((step) => {
          // Add dynamic fields for Additional configuration step
          if (
            step.id === 'step-additional-configuration' &&
            selectedOffering.options?.order?.length
          ) {
            return {
              ...step,
              fields: selectedOffering.options.order.map(
                (key) => `attributes.${key}`,
              ),
            };
          }
          return step;
        }),
    [selectedOffering],
  );

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  const [isLoading, setIsLoading] = useState(true);

  // Initialize project and cloud and initial attributes
  useEffectOnce(() => {
    const initializeFormValues = async () => {
      const initialValues: DeployFormData = {};
      const urlParams = getInitialValues();

      const context = {
        urlParams,
        marketplaceFilters,
        currentProject,
        currentCustomer,
        selectedOffering,
      };

      // Initialize project
      const resolved = await resolveProject(context);
      if (resolved.project) {
        initialValues.project = resolved.project;
      }
      if (resolved.customer) {
        initialValues.customer = resolved.customer;
      }

      // Initialize customer (organization) if not already set
      if (!initialValues.customer) {
        const customer = await resolveCustomer(context);
        if (customer) {
          initialValues.customer = customer;
        }
      }

      if (hasStepWithField(formSteps, 'offering') && selectedOffering) {
        initialValues.offering = selectedOffering;
      }

      if (props.initialLimits || props.limits) {
        initialValues.limits = props.initialLimits || props.limits;
      }
      if (props.plan) {
        initialValues.plan = props.plan;
      }

      Object.entries(initialValues).forEach(([key, value]) => {
        props.change(key, value);
      });

      setIsLoading(false);
    };

    initializeFormValues();
  });

  // Initialize limits and plan when the offering changes
  useEffect(() => {
    if (isEdit) return;
    if (selectedOffering) {
      if (hasStepWithField(formSteps, 'attributes.subnet_cidr')) {
        props.change('attributes.subnet_cidr', '192.168.42.0/24');
      }
      if (selectedOffering.type === MARKETPLACE_RANCHER) {
        props.change('attributes.nodes', []);
      }
      props.change('limits', {
        ...getDefaultLimits(selectedOffering),
        ...props.limits,
      });
    }
    if (hasStepWithField(formSteps, 'plan') && plans) {
      if (props.plan) {
        props.change('plan', props.plan);
      } else if (plans.length === 1) {
        props.change('plan', plans[0]);
      }
    }
  }, [selectedOffering, plans, project]);

  const [lastY, setLastY] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    formSteps.map(() => false),
  );

  const disabledSteps = useMemo(
    () =>
      formSteps.map(
        (step) =>
          step.id !== 'step-general' &&
          (isProjectInactive || noOrganizationOrProject || !canCreateOrder),
      ),
    [formSteps, isProjectInactive, noOrganizationOrProject, canCreateOrder],
  );

  const setScroll = useCallback(() => {
    if (window.scrollY > lastY) setLastY(window.scrollY);
  }, [lastY, setLastY]);

  useEffect(() => {
    window.addEventListener('scroll', setScroll);
    return () => {
      window.removeEventListener('scroll', setScroll);
    };
  }, [setScroll]);

  /**
   * If step contains mandatory field, we set completed if field is valid, i.e. filled.
   * If step contains only optional form elements, we set completed if user has seen this field.
   */
  useEffect(() => {
    stepRefs.current.forEach((el, i) => {
      if (completedSteps[i] && !formSteps[i].required) return;
      let completed = false;
      if (formSteps[i].required && formSteps[i].requiredFields?.length) {
        completed = formSteps[i].requiredFields.every((fieldName) =>
          Boolean(get(formData, fieldName)),
        );
      } else if (
        lastY >=
        el.current?.offsetTop - 120 - window.innerHeight / 2
      ) {
        completed = true;
      }
      if (completed !== completedSteps[i]) {
        setCompletedSteps((value) => {
          value[i] = completed;
          return value;
        });
        // Just for a force re-render
        setLastY(lastY + 1);
      }
    });
  }, [
    completedSteps,
    formData,
    lastY,
    setCompletedSteps,
    stepRefs.current,
    formSteps,
    props.form,
  ]);

  useEffect(() => {
    if (formData?.attributes?.flavor || formData?.attributes?.image) {
      const data = {
        image: formData?.attributes?.image,
        flavor: formData?.attributes?.flavor,
        system_volume_size: formData?.attributes?.system_volume_size,
      };
      props.change(
        'attributes.system_volume_size',
        calculateSystemVolumeSize(data),
      );
    }
  }, [formData?.attributes?.flavor, formData?.attributes?.image, props.change]);

  // Sync organization and project UUIDs to URL parameters
  useEffect(() => {
    const urlValues: any = {};
    if (customer?.uuid) {
      urlValues.organization_uuid = customer.uuid;
    }
    if (project?.uuid) {
      urlValues.project_uuid = project.uuid;
    }
    if (Object.keys(urlValues).length > 0) {
      syncFiltersToURL(urlValues);
    }
  }, [customer, project]);

  // To check if a customer has display_billing_info_in_projects to hide prices
  // When the customer is not selected from the selector, we may not have this field.
  const fetchCustomerBillingFlag = useCallback(async (customer) => {
    try {
      const _customer = await getCustomer(customer.uuid, [
        'display_billing_info_in_projects',
      ]);
      props.change('customer', { ...customer, ..._customer });
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (!customer) return;
    if ('display_billing_info_in_projects' in customer) return;
    fetchCustomerBillingFlag(customer);
  }, [customer]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (props.previewMode) {
    return (
      <form className="form">
        <div className="deploy-preview-steps d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
          {formSteps.map((step, i) => (
            <div ref={stepRefs.current[i]} key={step.id}>
              <step.component
                id={step.id}
                title={step.label}
                offering={selectedOffering}
                change={props.change}
                params={step.params}
                disabled={
                  step.id !== 'step-general' &&
                  (isProjectInactive ||
                    noOrganizationOrProject ||
                    !canCreateOrder)
                }
                previewMode
              />
            </div>
          ))}
        </div>
      </form>
    );
  }

  return (
    <DeployForm handleSubmit={props.handleSubmit} offering={selectedOffering}>
      <PageBarProvider scrollOffset={100}>
        <SidebarLayout.Header>
          <div className="d-flex justify-content-between align-items-center w-100">
            <h1 className="mb-0 flex-grow-1">
              {isEdit ? translate('Edit') : translate('Add')}{' '}
              {selectedOffering.name}
            </h1>
            {showExperimentalUiComponents && <DeployPageActions />}
          </div>
        </SidebarLayout.Header>
        <SidebarLayout.Container>
          <SidebarLayout.Body>
            {formSteps.map((step, i) => (
              <div ref={stepRefs.current[i]} key={step.id}>
                <step.component
                  id={step.id}
                  title={step.label}
                  offering={selectedOffering}
                  change={props.change}
                  params={step.params}
                  disabled={
                    step.id !== 'step-general' &&
                    (isProjectInactive ||
                      noOrganizationOrProject ||
                      !canCreateOrder)
                  }
                  disabledTooltip={
                    noOrganizationOrProject
                      ? translate(
                          'Select an organization and project to proceed.',
                        )
                      : isProjectInactive
                        ? translate('Project has reached its end date.')
                        : !canCreateOrder
                          ? translate(
                              'You are not allowed to create orders in this project.',
                            )
                          : null
                  }
                />
              </div>
            ))}
          </SidebarLayout.Body>

          <SidebarLayout.Sidebar transparent>
            <DeployPageSidebar
              steps={formSteps}
              offering={selectedOffering}
              completedSteps={completedSteps}
              disabledSteps={disabledSteps}
              updateMode={props.updateMode}
              order={props.order}
            />
          </SidebarLayout.Sidebar>
        </SidebarLayout.Container>
      </PageBarProvider>
    </DeployForm>
  );
};

export const DeployPage = reduxForm<{}, DeployPageProps>({
  form: ORDER_FORM_ID,
  touchOnChange: true,
})((props) => {
  const formData = useSelector(orderFormDataSelector);
  const selectedOffering: Offering = formData?.offering || props?.offering;
  const OrderFormComponent = getOrderFormComponent(selectedOffering.type);

  // Reset the form when the offering changes
  useEffect(() => {
    if (
      props.offering &&
      formData.offering &&
      props.offering?.uuid !== formData.offering?.uuid
    ) {
      props.reset();
    }
  }, [props.offering, formData]);

  return (
    <OrderFormComponent
      selectedOffering={selectedOffering}
      formData={formData}
      {...props}
    />
  );
});
