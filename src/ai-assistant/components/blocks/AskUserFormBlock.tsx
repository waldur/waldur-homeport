import { ThreadPrimitive, useAssistantState } from '@assistant-ui/react';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  InfoIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { BaseButton } from '@/core/buttons/BaseButton';
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
}> = ({ value, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div
      className="aui-ask-user-input-row"
      data-has-value={value.trim() ? '1' : '0'}
    >
      <input
        ref={ref}
        type="text"
        className="form-control form-control-sm aui-ask-user-text"
        placeholder={translate('Type your own answer…')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

const ButtonGroupQuestion: FC<{
  question: Question;
  answer: ButtonAnswer;
  onChange: (a: ButtonAnswer) => void;
}> = ({ question, answer, onChange }) => {
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
      <div className="d-flex flex-wrap gap-2">
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
              className="aui-ask-user-pill"
              data-picked={picked ? '1' : '0'}
              data-dimmed={dimmed ? '1' : '0'}
              title={opt.description || undefined}
            >
              {isMulti && (
                <span className="aui-ask-user-check" aria-hidden="true">
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
          className="aui-ask-user-other-toggle"
          aria-expanded={answer.otherOpen}
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
}> = ({ question, answer, onChange }) => {
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
    <div className="aui-ask-user-list">
      <Select
        isMulti={isMulti}
        isClearable
        value={value}
        onChange={handleChange}
        options={selectOptions}
        placeholder={translate('Search…')}
        formatOptionLabel={(opt: SelectOption) => (
          <div className="d-flex flex-column" style={{ minWidth: 0 }}>
            <span>{opt.label}</span>
            {opt.description && (
              <small className="text-muted">{opt.description}</small>
            )}
          </div>
        )}
      />
      <div className="mt-2">
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
          className="aui-ask-user-other-toggle aui-ask-user-other-toggle--compact"
          aria-expanded={answer.otherOpen}
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
          />
        )}
      </div>
    </div>
  );
};

const FreeformQuestion: FC<{
  answer: FreeformAnswer;
  onChange: (a: FreeformAnswer) => void;
}> = ({ answer, onChange }) => (
  <div
    className="aui-ask-user-input-row"
    data-has-value={answer.text.trim() ? '1' : '0'}
  >
    <input
      type="text"
      className="form-control form-control-sm aui-ask-user-text"
      placeholder={translate('Type your answer…')}
      value={answer.text}
      onChange={(e) => onChange({ text: e.target.value })}
    />
  </div>
);

export const AskUserFormBlock: FC<UIBlockProps> = ({ block }) => {
  const readOnly = useContext(OfflineBlockContext);
  // Audit log view has no AssistantRuntimeProvider, so the live wrapper
  // (which calls useAssistantState) must not mount in that path.
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
  const stale = useAssistantState((state) => {
    const messageId = state.message?.id;
    const messages = state.thread.messages;
    if (!messageId || !messages || messages.length === 0) return false;
    return messages[messages.length - 1].id !== messageId;
  });
  return <AskUserFormBody block={block} readOnly={false} stale={stale} />;
};

const AskUserFormBody: FC<
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
      className="aui-ask-user-block"
      data-submitted={showSubmitted ? '1' : '0'}
    >
      {block.context && (
        <div className="aui-ask-user-context">
          <InfoIcon size={13} weight="regular" />
          <span>{block.context}</span>
        </div>
      )}

      <div className="aui-ask-user-questions">
        {questions.map((q, i) => {
          const a = answers[i];
          const mode = modeFor(q);
          return (
            <div key={q.id} className="aui-ask-user-question">
              <div className="aui-ask-user-q-header">
                {q.header && (
                  <span className="aui-ask-user-chip">{q.header}</span>
                )}
                <label className="aui-ask-user-q-text">{q.question}</label>
              </div>
              <div className="aui-ask-user-q-body">
                {mode === 'freeform' ? (
                  <FreeformQuestion
                    answer={a as FreeformAnswer}
                    onChange={(next) => setAnswerAt(i, next)}
                  />
                ) : mode === 'buttons' ? (
                  <ButtonGroupQuestion
                    question={q}
                    answer={a as ButtonAnswer}
                    onChange={(next) => setAnswerAt(i, next)}
                  />
                ) : (
                  <SearchableListQuestion
                    question={q}
                    answer={a as ButtonAnswer}
                    onChange={(next) => setAnswerAt(i, next)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showSubmitted ? (
        <div
          className="aui-ask-user-footer aui-ask-user-footer--submitted"
          data-testid="ask-user-footer"
        >
          <CheckCircleIcon size={14} weight="fill" />
          <span>{translate('Sent to assistant')}</span>
        </div>
      ) : (
        <div className="aui-ask-user-footer" data-testid="ask-user-footer">
          {!readOnly && (
            <span className="aui-ask-user-progress">
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
              className="aui-ask-user-submit"
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
              <button
                type="button"
                className="btn btn-primary btn-sm aui-ask-user-submit"
                onClick={() => setSubmitted(true)}
              >
                <span>{translate('Send answers')}</span>
                <ArrowRightIcon size={13} weight="bold" />
              </button>
            </ThreadPrimitive.Suggestion>
          )}
        </div>
      )}
    </div>
  );
};
