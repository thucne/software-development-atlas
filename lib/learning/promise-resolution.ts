export type PromiseScenarioId =
  | 'return-value'
  | 'throw-error'
  | 'adopt-pending'
  | 'catch-recovery'
  | 'finally-transparent'
  | 'branching';

export type PromiseState = 'pending' | 'fulfilled' | 'rejected';

export type ResolutionKind =
  | 'unresolved'
  | 'fulfilled-value'
  | 'rejected-reason'
  | 'adopting';

export type PromiseNode = {
  id: string;
  label: string;
  state: PromiseState;
  resolution: ResolutionKind;
  value?: string;
  reason?: string;
  adopts?: string;
};

export type HandlerKind = 'then' | 'catch' | 'finally';

export type HandlerStep = {
  id: string;
  sourcePromiseId: string;
  resultPromiseId: string;
  kind: HandlerKind;
  label: string;
};

export type PromiseResolutionState = {
  scenarioId: PromiseScenarioId;
  promises: PromiseNode[];
  activeHandler: HandlerStep | null;
  output: string[];
  stepIndex: number;
  explanation: string;
  complete: boolean;
};

export type PromiseScenarioDefinition = {
  id: PromiseScenarioId;
  title: string;
  description: string;
  source: string;
};

export const PROMISE_SCENARIOS = [
  {
    id: 'return-value',
    title: 'Handler returns a value',
    description:
      'A fulfilled source runs its then handler, and the handler return value fulfills a distinct downstream promise.',
    source: `const p0 = Promise.resolve(10);\nconst p1 = p0.then((value) => value * 2);`,
  },
  {
    id: 'throw-error',
    title: 'Handler throws',
    description:
      'A throw inside a fulfillment handler rejects the new promise returned by then.',
    source: `const p0 = Promise.resolve('start');\nconst p1 = p0.then(() => {\n  throw new Error('boom');\n});`,
  },
  {
    id: 'adopt-pending',
    title: 'Adopt a still-pending promise',
    description:
      'The downstream promise can already be resolved to another promise while both remain pending.',
    source: `let settleInner;\nconst p2 = new Promise((resolve) => {\n  settleInner = resolve;\n});\nconst p0 = Promise.resolve('source');\nconst p1 = p0.then(() => p2);\n\n// later\nsettleInner(42);`,
  },
  {
    id: 'catch-recovery',
    title: 'catch recovers',
    description:
      'Returning normally from a rejection handler fulfills the promise returned by catch.',
    source: `const p0 = Promise.reject(new Error('network'));\nconst p1 = p0.catch(() => 'Guest');`,
  },
  {
    id: 'finally-transparent',
    title: 'Successful finally preserves the outcome',
    description:
      'A successful finally callback does not replace the original fulfillment value.',
    source: `const p0 = Promise.resolve(7);\nconst p1 = p0.finally(() => {\n  cleanup();\n});`,
  },
  {
    id: 'branching',
    title: 'Two independent downstream branches',
    description:
      'Calling then twice on one source creates two distinct result promises rather than one serialized chain.',
    source: `const p0 = Promise.resolve(10);\nconst p1 = p0.then((value) => value + 1);\nconst p2 = p0.then((value) => value * 2);`,
  },
] as const satisfies readonly PromiseScenarioDefinition[];

function fulfilled(
  id: string,
  label: string,
  value: string,
): PromiseNode {
  return {
    id,
    label,
    state: 'fulfilled',
    resolution: 'fulfilled-value',
    value,
  };
}

function rejected(
  id: string,
  label: string,
  reason: string,
): PromiseNode {
  return {
    id,
    label,
    state: 'rejected',
    resolution: 'rejected-reason',
    reason,
  };
}

function pending(id: string, label: string): PromiseNode {
  return {
    id,
    label,
    state: 'pending',
    resolution: 'unresolved',
  };
}

function initialPromises(id: PromiseScenarioId): PromiseNode[] {
  switch (id) {
    case 'return-value':
      return [fulfilled('P0', 'Source promise', '10')];
    case 'throw-error':
      return [fulfilled('P0', 'Source promise', 'start')];
    case 'adopt-pending':
      return [
        fulfilled('P0', 'Source promise', 'source'),
        pending('P2', 'Inner promise'),
      ];
    case 'catch-recovery':
      return [rejected('P0', 'Source promise', 'network')];
    case 'finally-transparent':
      return [fulfilled('P0', 'Source promise', '7')];
    case 'branching':
      return [fulfilled('P0', 'Shared source promise', '10')];
  }
}

export function createPromiseScenarioState(
  id: PromiseScenarioId,
): PromiseResolutionState {
  return {
    scenarioId: id,
    promises: initialPromises(id),
    activeHandler: null,
    output: [],
    stepIndex: 0,
    explanation:
      'Start with the source promise state. Chain methods create new promises; they do not mutate this source promise into the downstream result.',
    complete: false,
  };
}

function next(
  state: PromiseResolutionState,
  patch: Partial<PromiseResolutionState>,
): PromiseResolutionState {
  return {
    ...state,
    ...patch,
    stepIndex: state.stepIndex + 1,
  };
}

function addPromises(
  state: PromiseResolutionState,
  ...nodes: PromiseNode[]
): PromiseNode[] {
  return [...state.promises, ...nodes];
}

function updatePromise(
  state: PromiseResolutionState,
  id: string,
  patch: Partial<PromiseNode>,
): PromiseNode[] {
  return state.promises.map((promise) =>
    promise.id === id ? { ...promise, ...patch } : promise,
  );
}

function handler(
  id: string,
  sourcePromiseId: string,
  resultPromiseId: string,
  kind: HandlerKind,
  label: string,
): HandlerStep {
  return { id, sourcePromiseId, resultPromiseId, kind, label };
}

function stepReturnValue(
  state: PromiseResolutionState,
): PromiseResolutionState {
  const thenHandler = handler(
    'return-value-handler',
    'P0',
    'P1',
    'then',
    'then(value => value * 2)',
  );

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        promises: addPromises(state, pending('P1', 'Promise returned by then')),
        explanation:
          'Calling then creates a distinct result promise P1 immediately. P0 remains the fulfilled source promise.',
      });
    case 1:
      return next(state, {
        activeHandler: thenHandler,
        explanation:
          'Because P0 is fulfilled, its fulfillment handler can run with the value 10.',
      });
    case 2:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: '20',
        }),
        activeHandler: null,
        output: [...state.output, 'P1 fulfilled with 20'],
        explanation:
          'The handler returns the plain value 20, so the new promise P1 fulfills with 20.',
      });
    default:
      return next(state, {
        complete: true,
        explanation:
          'The source and downstream promises are distinct, and the return value determined P1\'s outcome.',
      });
  }
}

function stepThrowError(
  state: PromiseResolutionState,
): PromiseResolutionState {
  const thenHandler = handler(
    'throw-handler',
    'P0',
    'P1',
    'then',
    "then(() => { throw new Error('boom') })",
  );

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        promises: addPromises(state, pending('P1', 'Promise returned by then')),
        explanation: 'then creates P1 before its handler outcome is known.',
      });
    case 1:
      return next(state, {
        activeHandler: thenHandler,
        explanation: 'The fulfillment handler begins running.',
      });
    case 2:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'rejected',
          resolution: 'rejected-reason',
          reason: 'boom',
        }),
        activeHandler: null,
        output: [...state.output, 'P1 rejected with boom'],
        explanation:
          'The handler throws. That throw becomes the rejection reason of the new promise P1.',
      });
    default:
      return next(state, {
        complete: true,
        explanation:
          'A throw in a chain handler rejects the promise returned by that chain method.',
      });
  }
}

function stepAdoptPending(
  state: PromiseResolutionState,
): PromiseResolutionState {
  const thenHandler = handler(
    'adopt-handler',
    'P0',
    'P1',
    'then',
    'then(() => P2)',
  );

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        promises: addPromises(state, pending('P1', 'Promise returned by then')),
        explanation:
          'P2 already exists and is pending. Calling then creates a separate pending result promise P1.',
      });
    case 1:
      return next(state, {
        activeHandler: thenHandler,
        explanation: 'The handler runs and returns the still-pending promise P2.',
      });
    case 2:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'pending',
          resolution: 'adopting',
          adopts: 'P2',
        }),
        activeHandler: null,
        output: [...state.output, 'P1 is pending while adopting P2'],
        explanation:
          'P1 is now resolved to P2: it is locked to P2\'s eventual outcome, yet it remains pending because P2 is still pending. Resolved does not necessarily mean fulfilled.',
      });
    case 3:
      return next(state, {
        promises: updatePromise(state, 'P2', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: '42',
        }),
        output: [...state.output, 'P2 fulfilled with 42'],
        explanation:
          'The adopted promise P2 fulfills with 42. P1 is still shown separately because adoption is not identity.',
      });
    case 4:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: '42',
          adopts: undefined,
        }),
        output: [...state.output, 'P1 fulfilled with adopted value 42'],
        explanation:
          'P1 follows the adopted fulfillment outcome and fulfills with 42.',
      });
    default:
      return next(state, {
        complete: true,
        explanation:
          'The intermediate pending-plus-adopting state is why Promise resolution and fulfillment are not synonyms.',
      });
  }
}

function stepCatchRecovery(
  state: PromiseResolutionState,
): PromiseResolutionState {
  const catchHandler = handler(
    'recovery-handler',
    'P0',
    'P1',
    'catch',
    "catch(() => 'Guest')",
  );

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        promises: addPromises(state, pending('P1', 'Promise returned by catch')),
        explanation:
          'catch creates a new pending promise P1 while P0 remains rejected.',
      });
    case 1:
      return next(state, {
        activeHandler: catchHandler,
        explanation:
          'Because P0 is rejected, the rejection handler runs with the prior rejection reason.',
      });
    case 2:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: 'Guest',
        }),
        activeHandler: null,
        output: [...state.output, 'P1 fulfilled with Guest'],
        explanation:
          'The rejection handler returns normally with Guest, so P1 is fulfilled and downstream fulfillment handlers can continue.',
      });
    default:
      return next(state, {
        complete: true,
        explanation:
          'catch does not permanently mark a chain as failed; returning normally can recover to the fulfillment path.',
      });
  }
}

function stepFinallyTransparent(
  state: PromiseResolutionState,
): PromiseResolutionState {
  const finallyHandler = handler(
    'finally-handler',
    'P0',
    'P1',
    'finally',
    'finally(() => cleanup())',
  );

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        promises: addPromises(state, pending('P1', 'Promise returned by finally')),
        explanation:
          'finally creates a new result promise P1; it does not mutate P0.',
      });
    case 1:
      return next(state, {
        activeHandler: finallyHandler,
        explanation:
          'The cleanup callback runs without receiving or replacing the original value.',
      });
    case 2:
      return next(state, {
        activeHandler: null,
        output: [...state.output, 'cleanup succeeded'],
        explanation:
          'Cleanup succeeds. An ordinary successful return from finally is transparent to the prior fulfillment value.',
      });
    case 3:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: '7',
        }),
        output: [...state.output, 'P1 preserved value 7'],
        explanation:
          'P1 fulfills with the original value 7. The cleanup callback did not replace it.',
      });
    default:
      return next(state, {
        complete: true,
        explanation:
          'The lesson text separately covers finally callbacks that throw, reject, or delay propagation with a pending cleanup promise.',
      });
  }
}

function stepBranching(
  state: PromiseResolutionState,
): PromiseResolutionState {
  const branchAHandler = handler(
    'branch-a-handler',
    'P0',
    'P1',
    'then',
    'then(value => value + 1)',
  );
  const branchBHandler = handler(
    'branch-b-handler',
    'P0',
    'P2',
    'then',
    'then(value => value * 2)',
  );

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        promises: addPromises(
          state,
          pending('P1', 'Branch A result promise'),
          pending('P2', 'Branch B result promise'),
        ),
        explanation:
          'Two calls to then create two distinct downstream promises. Neither P1 nor P2 is downstream from the other.',
      });
    case 1:
      return next(state, {
        activeHandler: branchAHandler,
        explanation:
          'The simulator displays branch A first for clarity; this display order does not make branch B depend on branch A.',
      });
    case 2:
      return next(state, {
        promises: updatePromise(state, 'P1', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: '11',
        }),
        activeHandler: null,
        output: [...state.output, 'P1 fulfilled with 11'],
        explanation: 'Branch A returns 11, so P1 fulfills with 11.',
      });
    case 3:
      return next(state, {
        activeHandler: branchBHandler,
        explanation:
          'Branch B is another handler attached to P0, not a handler chained from P1.',
      });
    case 4:
      return next(state, {
        promises: updatePromise(state, 'P2', {
          state: 'fulfilled',
          resolution: 'fulfilled-value',
          value: '20',
        }),
        activeHandler: null,
        output: [...state.output, 'P2 fulfilled with 20'],
        explanation:
          'Branch B returns 20, so P2 fulfills independently. The two downstream branches share P0 but not each other.',
      });
    default:
      return next(state, {
        complete: true,
        explanation:
          'Branching from one source creates independent downstream promises; it does not itself serialize the branches.',
      });
  }
}

export function stepPromiseScenario(
  state: PromiseResolutionState,
): PromiseResolutionState {
  if (state.complete) return state;

  switch (state.scenarioId) {
    case 'return-value':
      return stepReturnValue(state);
    case 'throw-error':
      return stepThrowError(state);
    case 'adopt-pending':
      return stepAdoptPending(state);
    case 'catch-recovery':
      return stepCatchRecovery(state);
    case 'finally-transparent':
      return stepFinallyTransparent(state);
    case 'branching':
      return stepBranching(state);
  }
}
