import { get } from 'lodash';
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
import { reduxForm } from 'redux-form';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { parseDate } from '@waldur/core/dateUtils';
import { SidebarLayout } from '@waldur/form/SidebarLayout';
import { translate } from '@waldur/i18n';
import { AttributesType, Offering, Plan } from '@waldur/marketplace/types';
import { calculateSystemVolumeSize } from '@waldur/openstack/openstack-instance/utils';
import { MARKETPLACE_RANCHER } from '@waldur/rancher/cluster/create/constants';

import { getOrderFormComponent } from '../common/registry';
import { ORDER_FORM_ID } from '../details/constants';
import { getMarketplaceFilters } from '../landing/filter/store/selectors';
import { getDefaultLimits } from '../offerings/utils';
import { OrderResponse } from '../orders/types';
import {
  isExperimentalUiComponentsVisible,
  orderFormDataSelector,
} from '../utils';

import { DeployPageActions } from './DeployPageActions';
import { DeployPageSidebar } from './DeployPageSidebar';
import { formProjectSelector, hasStepWithField } from './utils';

import './DeployPage.scss';

interface DeployPageProps {
  offering: Offering;
  limits?: string[];
  updateMode?: boolean;
  previewMode?: boolean;
  cartItem?: OrderResponse;
  plan?: Plan;
  initialLimits?: AttributesType;
  initialAttributes?: AttributesType;
}

interface DeployFormData {
  project?: { name; uuid; url };
  customer?;
  offering?;
  attributes?: AttributesType;
  limits?;
  plan?;
}

export const BaseDeployPage = ({
  formData,
  inputFormSteps,
  selectedOffering,
  ...props
}) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const marketplaceFilters = useSelector(getMarketplaceFilters);

  const isEdit = useMemo(() => Boolean(props.cartItem), [props]);

  const project = useSelector(formProjectSelector);

  const isProjectInactive = useMemo(() => {
    if (project?.end_date) {
      const endDate = parseDate(project?.end_date);
      const now = parseDate(null);
      return endDate.hasSame(now, 'day') || endDate < now;
    }
    return false;
  }, [project]);

  const plans = useMemo(
    () => selectedOffering.plans.filter((plan) => plan.archived === false),
    [selectedOffering],
  );

  const formSteps = useMemo(
    () =>
      inputFormSteps.filter(
        (step) => (step.isActive && step.isActive(selectedOffering)) ?? true,
      ),
    [selectedOffering],
  );

  const stepRefs = useRef([]);
  stepRefs.current = formSteps.map(
    (_, i) => stepRefs.current[i] ?? createRef(),
  );

  // Initialize project and cloud and initial attributes
  useEffectOnce(() => {
    const initialValues: DeployFormData = {};

    if (selectedOffering.project) {
      initialValues.project = {
        name: selectedOffering.project_name,
        uuid: selectedOffering.project_uuid,
        url: selectedOffering.project,
      };
    }

    if (!selectedOffering.shared) {
      initialValues.customer = {
        name: selectedOffering.customer_name,
        uuid: selectedOffering.customer_uuid,
        url: selectedOffering.customer,
      };
    }

    const customerFilter = marketplaceFilters?.find(
      (item) => item.name === 'organization',
    );
    const projectFilter = marketplaceFilters?.find(
      (item) => item.name === 'project',
    );

    if (customerFilter?.value) {
      initialValues.customer = customerFilter.value;
    }
    if (projectFilter?.value) {
      initialValues.project = projectFilter.value;
    }
    if (hasStepWithField(formSteps, 'offering') && selectedOffering) {
      initialValues.offering = selectedOffering;
    }

    // initial attributes
    const attributes: AttributesType = {};
    if (props.initialAttributes) {
      Object.assign(attributes, props.initialAttributes);
      if (props.offering.options.order) {
        props.offering.options.order.forEach((key) => {
          const options = props.offering.options.options[key];
          if (options && options.default !== undefined) {
            attributes[key] = options.default;
          }
        });
      }
    }
    if (props.offering.type === OFFERING_TYPE_BOOKING) {
      // initial attributes.schedules
      if (attributes.schedules) {
        attributes.schedules = attributes.schedules.map((schedule) => ({
          ...schedule,
          start: new Date(schedule.start),
          end: new Date(schedule.end),
        }));
      } else {
        attributes.schedules = [];
      }
    }
    initialValues.attributes = attributes;

    if (props.initialLimits || props.limits) {
      initialValues.limits = props.initialLimits || props.limits;
    }
    if (props.plan) {
      initialValues.plan = props.plan;
    }

    if (Object.keys(initialValues).length > 0) {
      props.initialize(initialValues);
    }
  });

  // Initialize limits and plan when the offering changes
  useEffect(() => {
    if (isEdit) return;
    if (selectedOffering) {
      if (hasStepWithField(formSteps, 'attributes.subnet_cidr')) {
        props.change('attributes.subnet_cidr', '192.168.42.0/24');
      }
      if (selectedOffering.type === MARKETPLACE_RANCHER) {
        props.change('attributes.install_longhorn', false);
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
  }, [selectedOffering, plans]);

  const [lastY, setLastY] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    formSteps.map(() => false),
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
      } else if (lastY >= el.current.offsetTop - 120 - window.innerHeight / 2) {
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

  if (props.previewMode) {
    return (
      <form className="form">
        <div className="deploy-preview-steps d-flex flex-column flex-lg-row-fluid gap-5 gap-lg-7">
          {formSteps.map((step, i) => (
            <div ref={stepRefs.current[i]} key={step.id}>
              <step.component
                step={i + 1}
                id={step.id}
                title={step.label}
                offering={selectedOffering}
                observed={completedSteps[i]}
                change={props.change}
                params={step.params}
                disabled={
                  step.id !== 'step-project' &&
                  isProjectInactive &&
                  step.id !== 'step-customer'
                }
              />
            </div>
          ))}
        </div>
      </form>
    );
  }

  return (
    <SidebarLayout.Container>
      <SidebarLayout.Body>
        <div className="d-flex justify-content-between align-items-center pt-10">
          <h1 className="mb-0">
            {isEdit ? translate('Edit') : translate('Add')}{' '}
            {selectedOffering.name}
          </h1>
          {showExperimentalUiComponents && <DeployPageActions />}
        </div>

        {formSteps.map((step, i) => (
          <div ref={stepRefs.current[i]} key={step.id}>
            <step.component
              step={i + 1}
              id={step.id}
              title={step.label}
              offering={selectedOffering}
              observed={completedSteps[i]}
              change={props.change}
              params={step.params}
              required={Boolean(step.requiredFields?.length)}
              disabled={
                step.id !== 'step-project' &&
                isProjectInactive &&
                step.id !== 'step-customer'
              }
            />
          </div>
        ))}
      </SidebarLayout.Body>

      <SidebarLayout.Sidebar>
        <DeployPageSidebar
          steps={formSteps}
          offering={selectedOffering}
          completedSteps={completedSteps}
          updateMode={props.updateMode}
          cartItem={props.cartItem}
        />
      </SidebarLayout.Sidebar>
    </SidebarLayout.Container>
  );
};

export const DeployPage = reduxForm<{}, DeployPageProps>({
  form: ORDER_FORM_ID,
  touchOnChange: true,
})((props) => {
  const formData = useSelector(orderFormDataSelector);
  const selectedOffering: Offering = formData?.offering || props?.offering;
  const OrderFormComponent = getOrderFormComponent(selectedOffering.type);
  return (
    <OrderFormComponent
      selectedOffering={selectedOffering}
      formData={formData}
      {...props}
    />
  );
});
