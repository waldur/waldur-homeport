import { ThreadPrimitive, useAuiState } from '@assistant-ui/react';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  InfoIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { BaseInputField } from '@/form/InputField';
import { Select } from '@/form/select';
import { translate } from '@/i18n';

import { UIBlockProps } from '../../lib/types';

import { OfflineBlockContext } from './offlineBlockContext';

type Question = NonNullable<UIBlockProps['block']['questions']>[number];
type Option = NonNullable<Question['options']>[number];

// 8 options is the threshold at which a wrapping pill row stops scanning
// well at the 680px max-width; beyond it we switch to a searchable dropdown.
// Bumped from 4 → 8 because the LLM frequently emits 5–7 options for picks
// like region, workload, or service tier where a click-to-open dropdown is
// worse UX than tappable pills.
export const BUTTON_GROUP_OPTION_LIMIT = 8;

type Mode = 'buttons' | 'list' | 'freeform';

export const modeFor = (q: Question): Mode => {
  if (!q.options || q.options.length === 0) return 'freeform';
  return q.options.length <= BUTTON_GROUP_OPTION_LIMIT ? 'buttons' : 'list';
};

interface ButtonAnswer {
  picks: Option[]; // always an array; single-select stores [opt]
  other: string;
  otherOpen: boolean;
}

interface FreeformAnswer {
  text: string;
}

type Answer = ButtonAnswer | FreeformAnswer;

const isFreeform = (q: Question): boolean => modeFor(q) === 'freeform';

const initialAnswer = (q: Question): Answer =>
  isFreeform(q) ? { text: '' } : { picks: [], other: '', otherOpen: false };

export const isAnswered = (q: Question, a: Answer): boolean => {
  if (isFreeform(q)) return ((a as FreeformAnswer).text ?? '').trim() !== '';
  const ba = a as ButtonAnswer;
  if ((ba.other ?? '').trim() !== '') return true;
  return (ba.picks ?? []).length > 0;
};

// Compose the natural-language reply the user's selections become. We use
// the option `label` (human-readable) — the optional machine-friendly
// `value` is intentionally not echoed in the reply; if a downstream tool
// needs the UUID, the LLM looks it up from the persisted block instead.
export const composeReply = (
  questions: Question[],
  answers: Answer[],
): string => {
  const lines: string[] = [];
  questions.forEach((q, i) => {
    const a = answers[i];
    const head = q.header || q.question;
    let value: string;
    if (isFreeform(q)) {
      value = (a as FreeformAnswer).text.trim();
    } else {
      const ba = a as ButtonAnswer;
      const labels = ba.picks.map((o) => o.label);
      if (ba.other.trim()) labels.push(`"${ba.other.trim()}"`);
      value = labels.join(', ');
    }
    if (!value) return;
    const terminator = /[.!?]$/.test(value) ? '' : '.';
    lines.push(`${head}: ${value}${terminator}`);
  });
  return lines.join(' ');
};

const OtherAnswerInput: FC<{
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}> = ({ value, onChange, disabled }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);
  const hasValue = Boolean(value.trim());
  return (
    <div
      className="border-t border-primary pt-2.5 mt-1"
      data-has-value={hasValue ? '1' : '0'}
    >
      <BaseInputField
        ref={ref}
        type="text"
        size="sm"
        className={classNames(
          'h-[34px]',
          hasValue && 'border-[var(--border-brand-solid)] text-primary',
        )}
        placeholder={translate('Type your own answer…')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

const ButtonGroupQuestion: FC<{
  question: Question;
  answer: ButtonAnswer;
  onChange: (a: ButtonAnswer) => void;
  disabled: boolean;
}> = ({ question, answer, onChange, disabled }) => {
  const isMulti = !!question.multiSelect;
  const isPicked = (opt: Option) => answer.picks.some((p) => p.id === opt.id);

  const togglePick = (opt: Option) => {
    // Clicking a pill while the custom input is open collapses it —
    // picked pills and custom text are mutually exclusive.
    const closeCustom = answer.otherOpen ? { otherOpen: false, other: '' } : {};
    if (isMulti) {
      const next = isPicked(opt)
        ? answer.picks.filter((p) => p.id !== opt.id)
        : [...answer.picks, opt];
      onChange({ ...answer, ...closeCustom, picks: next });
    } else {
      onChange({
        ...answer,
        ...closeCustom,
        picks: isPicked(opt) ? [] : [opt],
      });
    }
  };

  // Single-select: dim the un-picked pills once a choice has been made so the
  // active pill stands out. Multi-select keeps full opacity on every pill
  // because the user is still building up the answer set.
  const hasSingleSelectPick = !isMulti && answer.picks.length > 0;

  return (
    <div role={isMulti ? 'group' : 'radiogroup'}>
      <div className="flex flex-wrap gap-1.5">
        {question.options!.map((opt) => {
          const picked = isPicked(opt);
          const dimmed = hasSingleSelectPick && !picked;
          return (
            <button
              key={opt.id}
              type="button"
              role={isMulti ? 'checkbox' : 'radio'}
              aria-checked={picked}
              onClick={() => togglePick(opt)}
              className={classNames(
                'inline-flex items-center gap-1.5 h-[34px] px-3.5 text-sm font-medium leading-none rounded-md border whitespace-nowrap cursor-pointer transition-colors duration-150',
                picked
                  ? 'text-[var(--text-brand-secondary)] bg-brand-subtle border-[var(--border-brand-solid)]'
                  : 'text-primary bg-secondary border-secondary enabled:hover:bg-tertiary enabled:hover:border-primary',
                dimmed && 'opacity-35',
                disabled && 'cursor-default opacity-70',
              )}
              data-picked={picked ? '1' : '0'}
              data-dimmed={dimmed ? '1' : '0'}
              title={opt.description || undefined}
              disabled={disabled}
            >
              {isMulti && (
                <span
                  className={classNames(
                    'inline-flex items-center justify-center shrink-0 size-3.5 rounded-sm border',
                    picked
                      ? 'text-[var(--text-primary-on-brand)] bg-[var(--bg-brand-solid)] border-[var(--border-brand-solid)]'
                      : 'text-secondary bg-secondary border-secondary',
                  )}
                  aria-hidden="true"
                >
                  {picked && <CheckIcon size={11} weight="bold" />}
                </span>
              )}
              <span>{opt.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...answer,
              otherOpen: !answer.otherOpen,
              other: answer.otherOpen ? '' : answer.other,
              picks: !answer.otherOpen ? [] : answer.picks,
            })
          }
          className="inline-flex items-center gap-1.5 h-[34px] px-3 text-sm font-medium text-secondary bg-transparent border border-dashed border-primary rounded-md cursor-pointer transition-colors duration-150 hover:text-primary hover:bg-tertiary hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-expanded={answer.otherOpen}
          disabled={disabled}
        >
          <PlusIcon size={11} weight="bold" />
          <span>
            {answer.otherOpen
              ? translate('Hide custom')
              : translate('Type your own')}
          </span>
        </button>
      </div>
      {answer.otherOpen && (
        <OtherAnswerInput
          value={answer.other}
          onChange={(other) => onChange({ ...answer, other })}
          disabled={disabled}
        />
      )}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  optionId: string;
}

const SearchableListQuestion: FC<{
  question: Question;
  answer: ButtonAnswer;
  onChange: (a: ButtonAnswer) => void;
  disabled: boolean;
}> = ({ question, answer, onChange, disabled }) => {
  const isMulti = !!question.multiSelect;

  const selectOptions = useMemo<SelectOption[]>(
    () =>
      question.options!.map((o) => ({
        // react-select dedupes on `value`; option ids are guaranteed unique
        // by the backend (q{i}o{j}), labels are not.
        value: o.id,
        label: o.label,
        description: o.description,
        optionId: o.id,
      })),
    [question.options],
  );

  const value = isMulti
    ? selectOptions.filter((so) =>
        answer.picks.some((p) => p.id === so.optionId),
      )
    : (selectOptions.find((so) =>
        answer.picks.some((p) => p.id === so.optionId),
      ) ?? null);

  const handleChange = (next: unknown) => {
    const picked = (
      !next ? [] : Array.isArray(next) ? next : [next]
    ) as SelectOption[];
    const picks = picked.map((so) =>
      question.options!.find((o) => o.id === so.optionId)!,
    );
    onChange({ ...answer, picks });
  };

  return (
    <div>
      <Select
        isMulti={isMulti}
        isClearable
        isDisabled={disabled}
        value={value}
        onChange={handleChange}
        options={selectOptions}
        placeholder={translate('Search…')}
        formatOptionLabel={(opt: SelectOption) => (
          <div className="flex flex-col min-w-0">
            <span>{opt.label}</span>
            {opt.description && (
              <small className="text-quaternary">{opt.description}</small>
            )}
          </div>
        )}
      />
      <div className="mt-1.5">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...answer,
              otherOpen: !answer.otherOpen,
              other: answer.otherOpen ? '' : answer.other,
              picks: !answer.otherOpen ? [] : answer.picks,
            })
          }
          className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary bg-transparent border-0 cursor-pointer transition-colors duration-150 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-expanded={answer.otherOpen}
          disabled={disabled}
        >
          <PlusIcon size={11} weight="bold" />
          <span>
            {answer.otherOpen
              ? translate('Hide custom')
              : translate('Type your own')}
          </span>
        </button>
        {answer.otherOpen && (
          <OtherAnswerInput
            value={answer.other}
            onChange={(other) => onChange({ ...answer, other })}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};

const FreeformQuestion: FC<{
  answer: FreeformAnswer;
  onChange: (a: FreeformAnswer) => void;
  disabled: boolean;
}> = ({ answer, onChange, disabled }) => {
  const hasValue = Boolean(answer.text.trim());
  return (
    <div
      className="border-t border-primary pt-2.5 mt-1"
      data-has-value={hasValue ? '1' : '0'}
    >
      <BaseInputField
        type="text"
        size="sm"
        className={classNames(
          'h-[34px]',
          hasValue && 'border-[var(--border-brand-solid)] text-primary',
        )}
        placeholder={translate('Type your answer…')}
        value={answer.text}
        onChange={(e) => onChange({ text: e.target.value })}
        disabled={disabled}
      />
    </div>
  );
};

export const AskUserFormBlock: FC<UIBlockProps> = ({ block }) => {
  const readOnly = useContext(OfflineBlockContext);
  // Audit log view has no AssistantRuntimeProvider, so the live wrapper
  // (which calls useAuiState) must not mount in that path.
  return readOnly ? (
    <AskUserFormBody block={block} readOnly stale={false} />
  ) : (
    <AskUserFormBlockLive block={block} />
  );
};

// Computes `stale` — true once a later message exists in the thread, meaning
// this form has already been answered (or otherwise superseded) and a second
// submission would be misleading.
const AskUserFormBlockLive: FC<UIBlockProps> = ({ block }) => {
  const stale = useAuiState((state) => {
    try {
      const messageId = state.message?.id;
      const messages = state.thread?.messages;
      if (!messageId || !messages || messages.length === 0) return false;
      return messages[messages.length - 1]?.id !== messageId;
    } catch {
      return false;
    }
  });
  return <AskUserFormBody block={block} readOnly={false} stale={stale} />;
};

export const AskUserFormBody: FC<
  UIBlockProps & { readOnly: boolean; stale: boolean }
> = ({ block, readOnly, stale }) => {
  const questions = block.questions || [];
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    questions.map(initialAnswer),
  );

  if (questions.length === 0) return null;

  const setAnswerAt = (i: number, next: Answer) => {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? next : a)));
  };

  const answeredCount = questions.reduce(
    (acc, q, i) => acc + (isAnswered(q, answers[i]) ? 1 : 0),
    0,
  );
  const allAnswered = answeredCount === questions.length;
  const reply = allAnswered ? composeReply(questions, answers) : '';

  // A stale block (a later message exists in the thread) shows the same
  // "Sent" footer as a freshly-submitted one — once a follow-up message
  // appears, the user has effectively answered and re-sending would be
  // misleading.
  const showSubmitted = submitted || stale;

  // Once the answer has been sent (or superseded by a later message) the
  // inputs lock so the record can't be silently changed after the fact. The
  // read-only log view keeps inputs interactive on purpose — there is no send
  // path there, and existing behaviour relies on it.
  const locked = showSubmitted;

  // Reading the form from chat history (OfflineBlockContext) is the only
  // case where sending is permanently blocked; otherwise we wait for the
  // user to fill out every question. Both cases need a tooltip per the UI
  // consistency rule on disabled buttons.
  const disabledReason = readOnly
    ? translate('Sending is disabled in logs.')
    : !allAnswered
      ? translate('Answer all questions before sending.')
      : null;

  return (
    <div
      className={classNames(
        'w-full max-w-[680px] mb-4 p-4 rounded-lg border border-primary text-sm leading-[1.75] text-primary transition-colors',
        showSubmitted ? 'bg-secondary' : 'bg-tertiary',
      )}
      data-submitted={showSubmitted ? '1' : '0'}
    >
      {block.context && (
        <div className="flex items-start gap-1.5 mb-3.5 text-sm leading-normal text-secondary">
          <InfoIcon
            size={13}
            weight="regular"
            className="shrink-0 mt-0.5 text-tertiary"
          />
          <span>{block.context}</span>
        </div>
      )}

      <div className="flex flex-col gap-4.5">
        {questions.map((q, i) => {
          const a = answers[i];
          const mode = modeFor(q);
          return (
            <div key={q.id} className="flex flex-col gap-2">
              <div className="flex flex-col items-start gap-1">
                {q.header && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium leading-[1.6] tracking-wider uppercase text-secondary bg-quaternary rounded-sm">
                    {q.header}
                  </span>
                )}
                <label className="m-0 text-sm font-semibold leading-tight text-primary">
                  {q.question}
                </label>
              </div>
              <div>
                {mode === 'freeform' ? (
                  <FreeformQuestion
                    answer={a as FreeformAnswer}
                    onChange={(next) => setAnswerAt(i, next)}
                    disabled={locked}
                  />
                ) : mode === 'buttons' ? (
                  <ButtonGroupQuestion
                    question={q}
                    answer={a as ButtonAnswer}
                    onChange={(next) => setAnswerAt(i, next)}
                    disabled={locked}
                  />
                ) : (
                  <SearchableListQuestion
                    question={q}
                    answer={a as ButtonAnswer}
                    onChange={(next) => setAnswerAt(i, next)}
                    disabled={locked}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showSubmitted ? (
        <div
          className="flex items-center justify-start gap-1.5 mt-4 pt-3.5 border-t border-primary text-sm text-secondary"
          data-testid="ask-user-footer"
        >
          <CheckCircleIcon
            size={14}
            weight="fill"
            className="text-brand shrink-0"
          />
          <span>{translate('Sent to assistant')}</span>
        </div>
      ) : (
        <div
          className="flex items-center justify-end gap-3 mt-4 pt-3.5 border-t border-primary"
          data-testid="ask-user-footer"
        >
          {!readOnly && (
            <span className="me-auto text-xs text-tertiary tabular-nums">
              {translate('{answered} of {total} answered', {
                answered: answeredCount,
                total: questions.length,
              })}
            </span>
          )}
          {disabledReason ? (
            <BaseButton
              variant="primary"
              size="sm"
              className="inline-flex items-center gap-1.5 disabled:cursor-not-allowed"
              label={translate('Send answers')}
              iconNode={<ArrowRightIcon size={13} weight="bold" />}
              iconRight
              disabled
              disabledReason={disabledReason}
            />
          ) : (
            <ThreadPrimitive.Suggestion
              prompt={reply}
              send
              clearComposer={false}
              asChild
            >
              <BaseButton
                variant="primary"
                size="sm"
                className="inline-flex items-center gap-1.5"
                onClick={() => setSubmitted(true)}
                label={translate('Send answers')}
                iconNode={<ArrowRightIcon size={13} weight="bold" />}
                iconRight
              />
            </ThreadPrimitive.Suggestion>
          )}
        </div>
      )}
    </div>
  );
};
