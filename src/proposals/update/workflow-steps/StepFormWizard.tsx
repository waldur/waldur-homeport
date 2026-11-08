import {
  CaretLeftIcon,
  CaretRightIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { FormApi } from 'final-form';
import { FC, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useFormState } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { ProgressStep, WizardStepIndicator } from '@/wizard';

import {
  pagesWithErrors,
  StepFormPage,
  stepFormPageLabel,
  StepFormValues,
} from './stepForm';

import './StepFormWizard.scss';

/**
 * The page a step dialog shows, among the pages its step has. Any page may be
 * opened at any time: the dialogs edit a step, they do not walk a process.
 */
export const useStepFormPage = (
  pages: StepFormPage[],
  initialPage?: StepFormPage,
) => {
  const [selected, setPage] = useState<StepFormPage>(initialPage ?? pages[0]);
  // A page can go away (another kind picked); fall back to the first.
  const page = pages.includes(selected) ? selected : pages[0];
  const index = pages.indexOf(page);
  return {
    page,
    setPage,
    isFirst: index === 0,
    isLast: index === pages.length - 1,
    goBack: () => setPage(pages[Math.max(index - 1, 0)]),
    goNext: () => setPage(pages[Math.min(index + 1, pages.length - 1)]),
  };
};

/**
 * Submits the form and, when the submission fails on a field, opens the
 * first page holding one: a refused field on another page would otherwise go
 * unseen.
 */
export const submitShowingErrors = async (
  event: FormEvent | undefined,
  handleSubmit: (event?: any) => Promise<any> | undefined,
  form: FormApi<StepFormValues>,
  pages: StepFormPage[],
  setPage: (page: StepFormPage) => void,
) => {
  await handleSubmit(event);
  const state = form.getState();
  if (!state.hasValidationErrors && !state.hasSubmitErrors) return;
  const [first] = pagesWithErrors(pages, {
    ...state.errors,
    ...state.submitErrors,
  });
  if (first) setPage(first);
};

/**
 * The pages a step dialog has, along its top. A page holding a field with an
 * error is flagged once the user tried to save.
 */
export const StepFormPageIndicator: FC<{
  pages: StepFormPage[];
  page: StepFormPage;
  onSelect(page: StepFormPage): void;
}> = ({ pages, page, onSelect }) => {
  const { errors, submitErrors, submitFailed, dirtySinceLastSubmit } =
    useFormState<StepFormValues>({
      subscription: {
        errors: true,
        submitErrors: true,
        submitFailed: true,
        dirtySinceLastSubmit: true,
      },
    });
  const failing = pagesWithErrors(pages, {
    ...(submitFailed ? errors : {}),
    ...(dirtySinceLastSubmit ? {} : submitErrors),
  });
  const failingKey = failing.join(',');

  // On a narrow screen the indicator scrolls sideways: keep the open page in
  // sight, also when a failed save opens another one.
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = container.current;
    const current = box?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!box || !current || box.scrollWidth <= box.clientWidth) return;
    const offset =
      current.getBoundingClientRect().left - box.getBoundingClientRect().left;
    box.scrollLeft += offset - (box.clientWidth - current.offsetWidth) / 2;
  }, [page]);

  // A page change is announced, "Step 2 of 5: Participants": the footer's
  // Next and Back do not move focus, so nothing else says the page changed.
  // When the button pressed went away with the page (Next on the last but
  // one page, Back on the second), focus goes to the open page's link
  // instead of falling back to the dialog.
  const [announcement, setAnnouncement] = useState('');
  const announced = useRef(page);
  useEffect(() => {
    if (announced.current === page) return;
    announced.current = page;
    setAnnouncement(
      translate('Step {number} of {count}: {page}', {
        number: pages.indexOf(page) + 1,
        count: pages.length,
        page: stepFormPageLabel(page),
      }),
    );
    // Not cancelled on a re-render: the form re-renders the dialog before
    // the next frame, and the focus move must still happen.
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (
        active &&
        active !== document.body &&
        active.getAttribute('role') !== 'dialog'
      )
        return;
      // The open page's step, a button marked as the current step.
      container.current
        ?.querySelector<HTMLElement>('button[aria-current="step"]')
        ?.focus();
    });
  }, [page, pages]);

  const steps = useMemo<ProgressStep[]>(
    () =>
      pages.map((key) => {
        const failed = failingKey.split(',').includes(key);
        return {
          key,
          completed: false,
          label: (
            <>
              {stepFormPageLabel(key)}
              {failed && (
                <span className="sr-only"> {translate('(has errors)')}</span>
              )}
            </>
          ),
          // Another page's name takes the Link component's look (text-anchor),
          // so it reads as clickable; the open page's stays plain.
          ...(key !== page && { labelClass: 'text-anchor' }),
          ...(failed
            ? {
                variant: 'danger',
                labelClass:
                  key !== page
                    ? 'text-anchor text-anchor-danger'
                    : 'text-danger',
                icon: <WarningCircleIcon size={16} weight="bold" />,
              }
            : {}),
        };
      }),
    [pages, failingKey, page],
  );

  if (pages.length < 2) return null;
  return (
    <div className="step-form-page-indicator w-full" ref={container}>
      <WizardStepIndicator
        steps={steps}
        value={steps[pages.indexOf(page)]}
        onClick={(_, index) => onSelect(pages[index])}
      />
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        data-testid="step-form-page-announcement"
      >
        {announcement}
      </div>
    </div>
  );
};

/** Back, at the start of a step dialog's footer, from the second page on. */
export const StepFormBackButton: FC<{ isFirst: boolean; goBack(): void }> = ({
  isFirst,
  goBack,
}) =>
  isFirst ? null : (
    <BaseButton
      variant="tertiary"
      size="lg"
      className="min-w-[var(--dialog-action-min-w)] me-auto"
      label={translate('Back')}
      iconNode={<CaretLeftIcon weight="bold" />}
      onClick={goBack}
    />
  );

/** Next, in a step dialog's footer, up to the last page. */
export const StepFormNextButton: FC<{
  isLast: boolean;
  goNext(): void;
  disabledReason?: string;
  variant?: 'primary' | 'secondary';
}> = ({ isLast, goNext, disabledReason, variant = 'secondary' }) =>
  isLast ? null : (
    <BaseButton
      variant={variant}
      size="lg"
      className="min-w-[var(--dialog-action-min-w)]"
      label={translate('Next')}
      iconNode={<CaretRightIcon weight="bold" />}
      iconRight={true}
      onClick={goNext}
      disabled={Boolean(disabledReason)}
      disabledReason={disabledReason}
    />
  );
