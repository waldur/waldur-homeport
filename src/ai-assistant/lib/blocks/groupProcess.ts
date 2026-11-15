import { UIBlock } from '@/ai-assistant/lib/types';

// VM card states after which the reply goes on (the backend ends a reply only
// on preview, success or error). Cards saved before the state was stored carry
// none, so an unknown state counts as ending the reply.
const VM_STATES_MID_REPLY = new Set(['form', 'project_form', 'offering_form']);

// Cards that end a reply: the model writes nothing after them, so the
// narration just before one is its only introduction. A VM card still loading
// has no state yet; it is usually a form, so it does not end the reply until
// its state arrives.
const endsReply = (block: UIBlock) =>
  block.key === 'ask_user_form' ||
  (block.key === 'vm_order' &&
    block.status !== 'loading' &&
    !VM_STATES_MID_REPLY.has(block.order_status ?? ''));

// A saved tool call without UI is flattened into the tool and an empty
// markdown result; neither is something the narration introduces.
export const isPlaceholder = (block: UIBlock) =>
  block.key === 'tool' || (block.key === 'markdown' && !block.content?.trim());

const isLeadIn = (blocks: UIBlock[], index: number) => {
  const next = blocks.slice(index + 1).find((block) => !isPlaceholder(block));
  return next !== undefined && endsReply(next);
};

/**
 * Split a reply into its working process (reasoning, and the narration a model
 * writes before a tool call, "let me check…") and its answer. Text is never
 * guessed to be narration: a tool's own message is answer, wherever it is.
 */
export function splitProcess(
  blocks: UIBlock[],
  {
    // Leave narration in place in the answer, for when nothing folds it.
    keepNarration = false,
  }: { keepNarration?: boolean } = {},
): {
  process: UIBlock[];
  answer: UIBlock[];
} {
  const process: UIBlock[] = [];
  const answer: UIBlock[] = [];
  blocks.forEach((block, index) => {
    if (block.key === 'reasoning') {
      process.push(block);
    } else if (block.key !== 'narration') {
      answer.push(block);
    } else if (isLeadIn(blocks, index)) {
      answer.push({ ...block, key: 'markdown' });
    } else {
      (keepNarration ? answer : process).push(block);
    }
  });
  return { process, answer };
}

/**
 * Fold the process of a reply into one reasoning block at the top, the way
 * thinking UIs show "Thought for Ns" above the answer. Each model call has its
 * own reasoning block, so a reply with tool calls would otherwise show a
 * header per call, between lines of narration.
 */
export function groupProcess(
  blocks: UIBlock[],
  { streaming = false }: { streaming?: boolean } = {},
): UIBlock[] {
  const split = splitProcess(blocks);
  const reasoning = split.process.filter((block) => block.key === 'reasoning');
  const hasAnswer = split.answer.some((block) => !isPlaceholder(block));
  // Narration stays in place when no header folds it, and when it is all a
  // finished reply has (its last model call failed, say), which would
  // otherwise be an empty bubble or a bare header.
  const { process, answer } =
    !reasoning.length || (!streaming && !hasAnswer)
      ? splitProcess(blocks, { keepNarration: true })
      : split;
  if (!reasoning.length) {
    // Until something follows it, the latest narration is the status line.
    const latest = answer.filter((block) => !isPlaceholder(block)).pop();
    return streaming && latest?.key === 'narration'
      ? answer.filter((block) => block !== latest)
      : answer;
  }

  const live = reasoning.find((block) => block.status === 'streaming');
  const doneMs = reasoning
    .filter((block) => block !== live)
    .reduce((total, block) => total + (block.duration_ms ?? 0), 0);
  const group: UIBlock = {
    // The first block's id keeps one component, and its open state, for the
    // whole reply.
    ...reasoning[0],
    content: process
      .map((block) => block.content)
      .filter(Boolean)
      .join('\n\n'),
    steps: process,
    status: live ? 'streaming' : 'complete',
    working: streaming && !hasAnswer,
    duration_ms: live ? undefined : doneMs,
    // Shifted back so the live timer counts the earlier calls' thinking too.
    startedAt: live?.startedAt ? live.startedAt - doneMs : undefined,
  };
  return [group, ...answer];
}

// The thinking header of a streaming reply while it still works, which then is
// the reply's one status row.
export const getWorkingProcess = (blocks: UIBlock[]) =>
  groupProcess(blocks, { streaming: true }).find(
    (block) => block.key === 'reasoning' && block.working,
  );

export const hasWorkingProcess = (blocks: UIBlock[]) =>
  getWorkingProcess(blocks) !== undefined;
