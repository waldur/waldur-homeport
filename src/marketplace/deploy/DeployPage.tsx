import { useRouter } from '@uirouter/react';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { get } from 'lodash-es';
import {
  FC,
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Form, useForm } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  OrderDetails,
  PublicOfferingDetails,
  marketplaceOrdersCreate,
  marketplaceOrdersUpdateAttachment,
  Offering,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { fileSerializer, formDataOptions } from '@/core/api';
import { parseDate } from '@/core/dateUtils';
import { getInitialValues, syncFiltersToURL } from '@/core/filters';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { getCustomer } from '@/customer/utils';
import { SidebarLayout } from '@/form/SidebarLayout';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { INSTANCE_TYPE } from '@/openstack/constants';
import { calculateSystemVolumeSize } from '@/openstack/openstack-instance/utils';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermissionOnAnyScope } from '@/permissions/hasPermission';
import { MARKETPLACE_RANCHER } from '@/rancher/cluster/create/constants';
import { useNotify } from '@/store/notify';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

import { getOrderFormComponent } from '../common/registry';
import { DeployFormData, Limits } from '../common/types';
import { PageBarProvider } from '../context';
import { formatOrderForCreate } from '../details/utils';
import { getMarketplaceFilters } from '../landing/filter/store/selectors';
import { getDefaultLimits, scrollToSectionById } from '../offerings/utils';
import { isExperimentalUiComponentsVisible } from '../utils';

import { DeployPageActions } from './DeployPageActions';
import { DeployPageSidebar } from './DeployPageSidebar';
import { resolveCustomer, resolveProject } from './initUtils';
import { NavigationBlocker } from './NavigationBlocker';
import { useOrderFormData } from './selectors';
import { OfferingConfigurationFormStep } from './types';
import { hasStepWithField } from './utils';

import './DeployPage.scss';

interface DeployPageProps {
  offering: Offering;
  limits?: Limits;
  previewMode?: boolean;
  initialLimits?: Limits;
  plan?: Plan;
}

interface BaseDeployPageProps extends DeployPageProps {
  order?: OrderDetails;
  selectedOffering: Offering;
  inputFormSteps: OfferingConfigurationFormStep[];
  initialLimits?: Limits;
  plan?: Plan;
  updateMode?: boolean;
}

export const BaseDeployPage = ({
  inputFormSteps,
  selectedOffering,
  ...props
}: BaseDeployPageProps) => {
  const form = useForm();
  const formData = useOrderFormData();
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const isEdit = useMemo(() => Boolean(props.order), [props]);

  const user = useUser();
  const { customer, project } = formData;

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

  // Initialize limits and plan when the offering changes
  useEffect(() => {
    if (isEdit) return;
    if (selectedOffering) {
      if (hasStepWithField(formSteps, 'attributes.subnet_cidr')) {
        form.change('attributes.subnet_cidr', '192.168.42.0/24');
      }
      if (selectedOffering.type === MARKETPLACE_RANCHER) {
        form.change('attributes.nodes', []);
      }
      if (selectedOffering.type === INSTANCE_TYPE) {
        form.change(
          'attributes.config_drive',
          Boolean(
            (selectedOffering as unknown as PublicOfferingDetails)
              .config_drive_default,
          ),
        );
      }
      form.change('limits', {
        ...getDefaultLimits(selectedOffering),
        ...props.limits,
      });
    }
    if (hasStepWithField(formSteps, 'plan') && plans) {
      if (props.plan) {
        form.change('plan', props.plan);
      } else if (plans.length === 1) {
        form.change('plan', plans[0]);
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
          const next = [...value];
          next[i] = completed;
          return next;
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
    form,
  ]);

  useEffect(() => {
    if (formData?.attributes?.flavor || formData?.attributes?.image) {
      const data = {
        image: formData?.attributes?.image,
        flavor: formData?.attributes?.flavor,
        system_volume_size: formData?.attributes?.system_volume_size,
      };
      form.change(
        'attributes.system_volume_size',
        calculateSystemVolumeSize(data),
      );
    }
  }, [formData?.attributes?.flavor, formData?.attributes?.image, form]);

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
      form.change('customer', { ...customer, ..._customer });
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (!customer) return;
    if ('display_billing_info_in_projects' in customer) return;
    fetchCustomerBillingFlag(customer);
  }, [customer]);

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
  );
};

export const DeployPage: FC<DeployPageProps> = (props) => {
  const { confirm } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();
  const router = useRouter();

  const marketplaceFilters = useSelector(getMarketplaceFilters);
  const currentCustomer = useCustomer();
  const currentProject = useProject();

  const [initialValues, setInitialValues] = useState<DeployFormData | null>(
    null,
  );

  useEffect(() => {
    const initializeFormValues = async () => {
      const values: DeployFormData = {};
      const urlParams = getInitialValues();

      const context = {
        urlParams,
        marketplaceFilters,
        currentProject,
        currentCustomer,
        selectedOffering: props.offering,
      };

      // Initialize project
      const resolved = await resolveProject(context);
      if (resolved.project) {
        values.project = resolved.project;
      }
      if (resolved.customer) {
        values.customer = resolved.customer;
      }

      // Initialize customer (organization) if not already set
      if (!values.customer) {
        const customer = await resolveCustomer(context);
        if (customer) {
          values.customer = customer;
        }
      }

      values.offering = props.offering;

      if (props.initialLimits || props.limits) {
        values.limits = props.initialLimits || props.limits;
      }
      if (props.plan) {
        values.plan = props.plan;
      }

      setInitialValues(values);
    };

    initializeFormValues();
  }, [props.offering, marketplaceFilters, currentCustomer, currentProject]);

  const handleMutate = useCallback(
    async (values: DeployFormData) => {
      await confirm(
        translate('Confirmation'),
        translate('Are you sure you want to submit the order?'),
      );
      try {
        const order = await marketplaceOrdersCreate({
          body: formatOrderForCreate(props.offering, values),
        });
        if (values.attachment instanceof File) {
          await marketplaceOrdersUpdateAttachment({
            path: { uuid: order.data.uuid },
            body: {
              attachment: fileSerializer(values.attachment),
            },
            ...formDataOptions,
          });
        }
        showSuccess(translate('Order has been submitted.'));
        router.stateService.go('marketplace-resource-details', {
          resource_uuid: order.data.marketplace_resource_uuid,
        });
      } catch (error) {
        const errorMessage = translate('Unable to submit order.');
        showErrorResponse(error, errorMessage);
        const errorData = {};
        const _errorData = error?.response?.data;
        if (_errorData && typeof _errorData === 'object') {
          for (const key of Object.keys(_errorData)) {
            if (key === 'non_field_errors') {
              Object.assign(errorData, { plan_entries: _errorData[key] });
              // Scroll to plan step
              scrollToSectionById('step-plan');
            } else {
              Object.assign(errorData, { [key]: _errorData[key] });
            }
          }
        }
        return {
          [FORM_ERROR]: errorMessage,
          ...errorData,
        };
      }
    },
    [props.offering, confirm, showErrorResponse, showSuccess, router],
  );

  if (!initialValues) {
    return <LoadingSpinner />;
  }

  return (
    <Form
      key={props.offering?.uuid}
      mutators={{ ...arrayMutators }}
      onSubmit={handleMutate}
      initialValues={initialValues}
      subscription={{ values: true }}
      render={({ values, handleSubmit }) => {
        const selectedOffering = values.offering || props.offering;
        const OrderFormComponent = getOrderFormComponent(selectedOffering.type);

        if (!OrderFormComponent) {
          return null;
        }

        return (
          <>
            <NavigationBlocker />
            <form onSubmit={handleSubmit}>
              <OrderFormComponent
                selectedOffering={selectedOffering}
                {...props}
              />
            </form>
          </>
        );
      }}
    />
  );
};
