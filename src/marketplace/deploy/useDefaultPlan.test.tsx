import { render, waitFor } from '@testing-library/react';
import { Field, Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';
import { ProviderPlanDetails as Plan } from 'waldur-js-client';

import { useDefaultPlan } from './useDefaultPlan';

const onlyPlan = { uuid: 'plan-1', name: 'Default' } as Plan;
const otherPlan = { uuid: 'plan-2', name: 'Large' } as Plan;
// The same plan as `otherPlan`, as a caller further from the offering might
// still be holding it.
const stalePlan = { uuid: 'plan-2', name: 'Large (stale)' } as Plan;
// Plans of a second offering, the one FormCloudStep switches to.
const switchedPlan = { uuid: 'plan-3', name: 'Other cloud' } as Plan;
const switchedLargePlan = {
  uuid: 'plan-4',
  name: 'Other cloud, large',
} as Plan;

const offeringOf = (...plans: Plan[]) => ({ uuid: 'offering-1', plans }) as any;

type HookProps = Parameters<typeof useDefaultPlan>[0];

const Probe = (props: HookProps) => {
  useDefaultPlan(props);
  return null;
};

/**
 * Mirrors DeployPage: `keepDirtyOnReinitialize`, and a registered `plan` field
 * (PlanSelectField's). Both matter -- final-form preserves a dirty value across
 * a reinitialisation only for fields that are registered, so a harness without
 * them reproduces a loss the form does not have, and the tests would be
 * exercising the harness. `registerPlanField: false` is the case that is left:
 * FormPlanStep renders nothing when the offering has no orderable plans.
 *
 * The field goes before the probe because in DeployPage the hook sits in the
 * parent and the field in a child step, whose effects React flushes first.
 */
const renderForm = (
  initialValues: object,
  props: HookProps,
  { registerPlanField = true } = {},
) => {
  let form;
  let current = { initialValues, props };
  const ui = () => (
    <Form
      onSubmit={() => undefined}
      initialValues={current.initialValues}
      keepDirtyOnReinitialize
      subscription={{ values: true }}
      render={({ form: formApi }) => {
        form = formApi;
        return (
          <>
            {registerPlanField && <Field name="plan" render={() => null} />}
            <Probe {...current.props} />
          </>
        );
      }}
    />
  );
  const result = render(ui());
  return {
    getPlan: () => form.getState().values.plan,
    reinitialize: (initialValues: object) => {
      current = { ...current, initialValues };
      result.rerender(ui());
    },
    switchOffering: (offering: any) => {
      current = { ...current, props: { ...current.props, offering } };
      result.rerender(ui());
    },
  };
};

describe('useDefaultPlan', () => {
  it('selects the only plan of the offering', async () => {
    const { getPlan } = renderForm({}, { offering: offeringOf(onlyPlan) });

    await waitFor(() => expect(getPlan()).toBe(onlyPlan));
  });

  it('leaves the choice to the user when there are several plans', () => {
    const { getPlan } = renderForm(
      {},
      { offering: offeringOf(onlyPlan, otherPlan) },
    );

    expect(getPlan()).toBeUndefined();
  });

  it('selects the plan the page was opened with', async () => {
    const { getPlan } = renderForm(
      {},
      { offering: offeringOf(onlyPlan, otherPlan), plan: otherPlan },
    );

    await waitFor(() => expect(getPlan()).toBe(otherPlan));
  });

  it("prefers the offering's own copy of the plan it was opened with", async () => {
    // PlanSelectField labels the held object and useOrderPrices prices it, so
    // holding a caller's staler copy of the same plan is user-visible.
    const { getPlan } = renderForm(
      {},
      { offering: offeringOf(onlyPlan, otherPlan), plan: stalePlan },
    );

    await waitFor(() => expect(getPlan()).toBe(otherPlan));
  });

  it('does nothing when skipped', () => {
    const { getPlan } = renderForm(
      {},
      { offering: offeringOf(onlyPlan), skip: true },
    );

    expect(getPlan()).toBeUndefined();
  });

  describe('when FormCloudStep switches the offering under the form', () => {
    it('takes the only plan of the offering switched to', async () => {
      const { getPlan, switchOffering } = renderForm(
        {},
        { offering: offeringOf(onlyPlan) },
      );
      await waitFor(() => expect(getPlan()).toBe(onlyPlan));

      switchOffering(offeringOf(switchedPlan));

      await waitFor(() => expect(getPlan()).toBe(switchedPlan));
    });

    it('does not reuse the plan the page was opened with', async () => {
      const { getPlan, switchOffering } = renderForm(
        {},
        { offering: offeringOf(onlyPlan, otherPlan), plan: otherPlan },
      );
      await waitFor(() => expect(getPlan()).toBe(otherPlan));

      switchOffering(offeringOf(switchedPlan));

      await waitFor(() => expect(getPlan()).toBe(switchedPlan));
    });

    it('clears the plan left behind when the offering has several', async () => {
      const { getPlan, switchOffering } = renderForm(
        {},
        { offering: offeringOf(onlyPlan) },
      );
      await waitFor(() => expect(getPlan()).toBe(onlyPlan));

      switchOffering(offeringOf(switchedPlan, switchedLargePlan));

      await waitFor(() => expect(getPlan()).toBeUndefined());
    });

    it('clears a plan foreign to the offering even when it was held all along', async () => {
      const { getPlan } = renderForm(
        { plan: otherPlan },
        { offering: offeringOf(switchedPlan, switchedLargePlan) },
      );

      await waitFor(() => expect(getPlan()).toBeUndefined());
    });

    it('leaves that foreign plan alone when skipped', () => {
      // The pair above and below the skip guard: edit mode carries the order's
      // own plan, which need not be among the offering's orderable ones.
      const { getPlan } = renderForm(
        { plan: otherPlan },
        { offering: offeringOf(switchedPlan, switchedLargePlan), skip: true },
      );

      expect(getPlan()).toBe(otherPlan);
    });
  });

  describe('when the form is reinitialised', () => {
    it('leaves a plan the form still holds alone', async () => {
      // keepDirtyOnReinitialize carries the plan through; the hook must not
      // re-seed or clear it. Identity, so a needless rewrite fails too.
      const { getPlan, reinitialize } = renderForm(
        {},
        { offering: offeringOf(onlyPlan) },
      );
      await waitFor(() => expect(getPlan()).toBe(onlyPlan));

      reinitialize({ project: { uuid: 'project-1' } });

      await waitFor(() => expect(getPlan()).toBe(onlyPlan));
    });

    it('restores the default when the plan field is not registered', async () => {
      // Nothing preserves an unregistered field, so this is the reinitialisation
      // case the hook itself still has to cover.
      const { getPlan, reinitialize } = renderForm(
        {},
        { offering: offeringOf(onlyPlan) },
        { registerPlanField: false },
      );
      await waitFor(() => expect(getPlan()).toBe(onlyPlan));

      reinitialize({ project: { uuid: 'project-1' } });

      await waitFor(() => expect(getPlan()).toBe(onlyPlan));
    });
  });
});
