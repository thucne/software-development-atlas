export type ScenarioId =
  | 'promise-vs-timer'
  | 'nested-microtasks'
  | 'timer-queues-promise'
  | 'rendering-opportunity'
  | 'microtask-starvation'
  | 'multiple-task-sources';

export type TaskSource =
  | 'script'
  | 'timer'
  | 'user-interaction'
  | 'networking'
  | 'rendering';

export type WorkKind = 'task' | 'microtask' | 'animation-frame';

export type WorkItem = {
  id: string;
  label: string;
  kind: WorkKind;
  source?: TaskSource;
};

export type EventLoopStatus =
  | 'running-work'
  | 'microtask-checkpoint'
  | 'scheduler-choice'
  | 'rendering-opportunity'
  | 'rendering-update'
  | 'idle'
  | 'starvation-warning';

export type SchedulerChoice = {
  id: string;
  label: string;
  source: TaskSource;
};

export type EventLoopState = {
  scenarioId: ScenarioId;
  current: WorkItem | null;
  microtasks: WorkItem[];
  runnableTasksBySource: Partial<Record<TaskSource, WorkItem[]>>;
  animationFrameCallbacks: WorkItem[];
  output: string[];
  stepIndex: number;
  status: EventLoopStatus;
  explanation: string;
  choices: SchedulerChoice[];
  complete: boolean;
};

export type ScenarioDefinition = {
  id: ScenarioId;
  title: string;
  description: string;
  source: string;
};

const scriptTask: WorkItem = {
  id: 'script',
  label: 'initial script',
  kind: 'task',
  source: 'script',
};

const timerTask: WorkItem = {
  id: 'timer',
  label: 'timer callback',
  kind: 'task',
  source: 'timer',
};

const promiseMicrotask: WorkItem = {
  id: 'promise',
  label: 'Promise reaction',
  kind: 'microtask',
};

export const EVENT_LOOP_SCENARIOS = [
  {
    id: 'promise-vs-timer',
    title: 'Promise reaction vs timer',
    description:
      'Run-to-completion first, then a microtask checkpoint before the later timer task.',
    source: `console.log('A');\nsetTimeout(() => console.log('timer'), 0);\nPromise.resolve().then(() => console.log('promise'));\nconsole.log('B');`,
  },
  {
    id: 'nested-microtasks',
    title: 'A microtask queues another microtask',
    description:
      'A microtask created during the checkpoint can run before that checkpoint finishes.',
    source: `console.log('script');\nqueueMicrotask(() => {\n  console.log('microtask A');\n  queueMicrotask(() => console.log('microtask B'));\n});`,
  },
  {
    id: 'timer-queues-promise',
    title: 'A timer queues a Promise reaction',
    description:
      'A Promise reaction created inside a timer participates in the checkpoint after that task.',
    source: `console.log('script');\nsetTimeout(() => {\n  console.log('timer');\n  Promise.resolve().then(() => console.log('promise from timer'));\n}, 0);\nsetTimeout(() => console.log('later task'), 0);`,
  },
  {
    id: 'rendering-opportunity',
    title: 'Rendering opportunity and requestAnimationFrame',
    description:
      'requestAnimationFrame callbacks belong to rendering updates when the browser takes a rendering opportunity.',
    source: `requestAnimationFrame(() => console.log('animation frame'));\nconsole.log('script');`,
  },
  {
    id: 'microtask-starvation',
    title: 'Bounded microtask starvation',
    description:
      'The simulator stops after five self-producing microtasks instead of freezing the page.',
    source: `function again() {\n  console.log('microtask');\n  queueMicrotask(again);\n}\nqueueMicrotask(again);`,
  },
  {
    id: 'multiple-task-sources',
    title: 'Multiple runnable task sources',
    description:
      'Choose between two valid runnable sources instead of inventing one universal cross-source FIFO order.',
    source: `// Simplified teaching scenario:\n// a timer task and a user-interaction task are both runnable.`,
  },
] as const satisfies readonly ScenarioDefinition[];

function initialState(scenarioId: ScenarioId): EventLoopState {
  return {
    scenarioId,
    current: scriptTask,
    microtasks: [],
    runnableTasksBySource: {},
    animationFrameCallbacks: [],
    output: [],
    stepIndex: 0,
    status: 'running-work',
    explanation: 'The initial script is the currently selected work.',
    choices: [],
    complete: false,
  };
}

export function createScenarioState(id: ScenarioId): EventLoopState {
  return initialState(id);
}

function next(
  state: EventLoopState,
  patch: Partial<EventLoopState>,
): EventLoopState {
  return {
    ...state,
    ...patch,
    stepIndex: state.stepIndex + 1,
  };
}

function appendOutput(state: EventLoopState, line: string) {
  return [...state.output, line];
}

function taskQueuesWith(
  state: EventLoopState,
  source: TaskSource,
  item: WorkItem,
) {
  return {
    ...state.runnableTasksBySource,
    [source]: [...(state.runnableTasksBySource[source] ?? []), item],
  };
}

function withoutFirstTask(state: EventLoopState, source: TaskSource) {
  const queue = state.runnableTasksBySource[source] ?? [];
  return {
    ...state.runnableTasksBySource,
    [source]: queue.slice(1),
  };
}

function stepPromiseVsTimer(state: EventLoopState): EventLoopState {
  switch (state.stepIndex) {
    case 0:
      return next(state, {
        output: appendOutput(state, 'A'),
        explanation: 'Synchronous code runs inside the current script task.',
      });
    case 1:
      return next(state, {
        runnableTasksBySource: taskQueuesWith(state, 'timer', timerTask),
        explanation:
          'The timer callback becomes later task work; a 0ms delay does not run it immediately.',
      });
    case 2:
      return next(state, {
        microtasks: [...state.microtasks, promiseMicrotask],
        explanation:
          'The fulfilled Promise queues its reaction for browser microtask processing.',
      });
    case 3:
      return next(state, {
        output: appendOutput(state, 'B'),
        explanation:
          'The current script keeps running to completion before later callbacks run.',
      });
    case 4:
      return next(state, {
        current: null,
        status: 'microtask-checkpoint',
        explanation:
          'The script task has finished, so the browser reaches a microtask checkpoint.',
      });
    case 5:
      return next(state, {
        current: promiseMicrotask,
        microtasks: state.microtasks.slice(1),
        output: appendOutput(state, 'promise'),
        status: 'microtask-checkpoint',
        explanation:
          'The Promise reaction runs during the microtask checkpoint before the later timer task.',
      });
    case 6:
      return next(state, {
        current: timerTask,
        runnableTasksBySource: withoutFirstTask(state, 'timer'),
        status: 'running-work',
        explanation:
          'The microtask queue is empty. The later timer task can now be selected.',
      });
    case 7:
      return next(state, {
        output: appendOutput(state, 'timer'),
        explanation: 'The selected timer callback now runs.',
      });
    default:
      return next(state, {
        current: null,
        status: 'idle',
        complete: true,
        explanation: 'No work remains in this scenario.',
      });
  }
}

function stepNestedMicrotasks(state: EventLoopState): EventLoopState {
  const microtaskA: WorkItem = {
    id: 'microtask-a',
    label: 'microtask A',
    kind: 'microtask',
  };
  const microtaskB: WorkItem = {
    id: 'microtask-b',
    label: 'microtask B',
    kind: 'microtask',
  };

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        output: appendOutput(state, 'script'),
        explanation: 'The initial script runs first.',
      });
    case 1:
      return next(state, {
        microtasks: [microtaskA],
        explanation: 'The script queues microtask A.',
      });
    case 2:
      return next(state, {
        current: null,
        status: 'microtask-checkpoint',
        explanation:
          'The script finishes and the browser begins a microtask checkpoint.',
      });
    case 3:
      return next(state, {
        current: microtaskA,
        microtasks: [microtaskB],
        output: appendOutput(state, 'microtask A'),
        explanation:
          'Microtask A runs and queues microtask B while the checkpoint is still active.',
      });
    case 4:
      return next(state, {
        current: microtaskB,
        microtasks: [],
        output: appendOutput(state, 'microtask B'),
        explanation:
          'The checkpoint keeps draining, so the newly queued microtask B runs before it finishes.',
      });
    default:
      return next(state, {
        current: null,
        status: 'idle',
        complete: true,
        explanation: 'The microtask queue is empty and this scenario is complete.',
      });
  }
}

function stepTimerQueuesPromise(state: EventLoopState): EventLoopState {
  const laterTask: WorkItem = {
    id: 'later-task',
    label: 'later timer task',
    kind: 'task',
    source: 'timer',
  };
  const promiseFromTimer: WorkItem = {
    id: 'promise-from-timer',
    label: 'Promise reaction from timer',
    kind: 'microtask',
  };

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        output: appendOutput(state, 'script'),
        explanation: 'The script runs first.',
      });
    case 1:
      return next(state, {
        runnableTasksBySource: {
          ...state.runnableTasksBySource,
          timer: [timerTask, laterTask],
        },
        explanation:
          'Two timer callbacks become runnable in their task source order.',
      });
    case 2:
      return next(state, {
        current: timerTask,
        runnableTasksBySource: withoutFirstTask(state, 'timer'),
        explanation: 'After the script finishes, the first timer task is selected.',
      });
    case 3:
      return next(state, {
        output: appendOutput(state, 'timer'),
        microtasks: [promiseFromTimer],
        explanation:
          'The timer callback runs and queues a Promise reaction as a microtask.',
      });
    case 4:
      return next(state, {
        current: null,
        status: 'microtask-checkpoint',
        explanation:
          'When the timer task finishes, the browser reaches a microtask checkpoint.',
      });
    case 5:
      return next(state, {
        current: promiseFromTimer,
        microtasks: [],
        output: appendOutput(state, 'promise from timer'),
        explanation:
          'The Promise reaction runs during the checkpoint before the later timer task.',
      });
    case 6:
      return next(state, {
        current: laterTask,
        runnableTasksBySource: withoutFirstTask(state, 'timer'),
        status: 'running-work',
        explanation:
          'After the checkpoint empties, the next runnable timer task can be selected.',
      });
    case 7:
      return next(state, {
        output: appendOutput(state, 'later task'),
        explanation: 'The later task now runs.',
      });
    default:
      return next(state, {
        current: null,
        status: 'idle',
        complete: true,
        explanation: 'No work remains in this scenario.',
      });
  }
}

function stepRenderingOpportunity(state: EventLoopState): EventLoopState {
  const animationFrame: WorkItem = {
    id: 'animation-frame',
    label: 'requestAnimationFrame callback',
    kind: 'animation-frame',
    source: 'rendering',
  };

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        animationFrameCallbacks: [animationFrame],
        explanation:
          'The script registers a requestAnimationFrame callback for a future rendering update.',
      });
    case 1:
      return next(state, {
        output: appendOutput(state, 'script'),
        explanation: 'The current script still runs to completion first.',
      });
    case 2:
      return next(state, {
        current: null,
        status: 'microtask-checkpoint',
        explanation:
          'The current work has finished; the relevant microtask checkpoint is empty.',
      });
    case 3:
      return next(state, {
        status: 'rendering-opportunity',
        explanation:
          'This scenario now exposes a rendering opportunity. Real browsers control when such opportunities occur.',
      });
    case 4:
      return next(state, {
        current: animationFrame,
        animationFrameCallbacks: [],
        status: 'rendering-update',
        explanation:
          'During the rendering update, the requestAnimationFrame callback can run.',
      });
    case 5:
      return next(state, {
        output: appendOutput(state, 'animation frame'),
        explanation:
          'The animation-frame callback runs as part of rendering-related work, not as a generic post-microtask task queue.',
      });
    default:
      return next(state, {
        current: null,
        status: 'idle',
        complete: true,
        explanation: 'The simplified rendering scenario is complete.',
      });
  }
}

function stepMicrotaskStarvation(state: EventLoopState): EventLoopState {
  const currentCount = state.output.filter((line) =>
    line.startsWith('microtask'),
  ).length;

  if (state.stepIndex === 0) {
    return next(state, {
      output: appendOutput(state, 'script'),
      microtasks: [
        { id: 'microtask-1', label: 'self-producing microtask', kind: 'microtask' },
      ],
      explanation: 'The script queues a self-producing microtask.',
    });
  }

  if (state.stepIndex === 1) {
    return next(state, {
      current: null,
      status: 'microtask-checkpoint',
      explanation:
        'The browser begins the checkpoint and will keep processing while microtasks remain.',
    });
  }

  if (currentCount < 5) {
    const nextCount = currentCount + 1;
    const nextItem: WorkItem = {
      id: `microtask-${nextCount + 1}`,
      label: 'self-producing microtask',
      kind: 'microtask',
    };

    return next(state, {
      current: state.microtasks[0] ?? null,
      microtasks: [nextItem],
      output: appendOutput(state, `microtask ${nextCount}`),
      status: 'microtask-checkpoint',
      explanation:
        'This microtask queues another microtask before the checkpoint can become empty.',
    });
  }

  return next(state, {
    current: null,
    status: 'starvation-warning',
    complete: true,
    explanation:
      'More microtasks keep being produced. Later tasks and rendering cannot make progress in this model until the checkpoint can finish.',
  });
}

const timerChoiceTask: WorkItem = {
  id: 'choice-timer',
  label: 'timer task',
  kind: 'task',
  source: 'timer',
};

const interactionChoiceTask: WorkItem = {
  id: 'choice-interaction',
  label: 'user-interaction task',
  kind: 'task',
  source: 'user-interaction',
};

function schedulerChoices(): SchedulerChoice[] {
  return [
    { id: timerChoiceTask.id, label: 'Run timer task', source: 'timer' },
    {
      id: interactionChoiceTask.id,
      label: 'Run user-interaction task',
      source: 'user-interaction',
    },
  ];
}

function stepMultipleTaskSources(state: EventLoopState): EventLoopState {
  if (state.status === 'scheduler-choice') return state;

  if (state.current?.id === timerChoiceTask.id) {
    return next(state, {
      output: appendOutput(state, 'timer task'),
      current: interactionChoiceTask,
      runnableTasksBySource: withoutFirstTask(state, 'user-interaction'),
      explanation:
        'The timer path was one valid scheduling choice. With only the user-interaction task left in this simplified scenario, it can run later.',
    });
  }

  if (state.current?.id === interactionChoiceTask.id) {
    return next(state, {
      output: appendOutput(state, 'user-interaction task'),
      current: timerChoiceTask,
      runnableTasksBySource: withoutFirstTask(state, 'timer'),
      explanation:
        'The user-interaction path was one valid scheduling choice. With only the timer task left in this simplified scenario, it can run later.',
    });
  }

  if (state.stepIndex >= 5 && state.current) {
    return next(state, {
      output: appendOutput(state, state.current.label),
      current: null,
      status: 'idle',
      complete: true,
      explanation:
        'Both runnable tasks have now run. Their initial cross-source order was intentionally not treated as a universal guarantee.',
    });
  }

  switch (state.stepIndex) {
    case 0:
      return next(state, {
        runnableTasksBySource: {
          timer: [timerChoiceTask],
          'user-interaction': [interactionChoiceTask],
        },
        explanation:
          'This simplified scenario has runnable work from two unrelated task sources.',
      });
    case 1:
      return next(state, {
        current: null,
        status: 'microtask-checkpoint',
        explanation: 'The current script is finished and the microtask queue is empty.',
      });
    default:
      return next(state, {
        status: 'scheduler-choice',
        choices: schedulerChoices(),
        explanation:
          'Both sources are runnable. Choose either path: the lesson intentionally does not invent one universal cross-source FIFO guarantee.',
      });
  }
}

export function stepEventLoop(state: EventLoopState): EventLoopState {
  if (state.complete) return state;

  switch (state.scenarioId) {
    case 'promise-vs-timer':
      return stepPromiseVsTimer(state);
    case 'nested-microtasks':
      return stepNestedMicrotasks(state);
    case 'timer-queues-promise':
      return stepTimerQueuesPromise(state);
    case 'rendering-opportunity':
      return stepRenderingOpportunity(state);
    case 'microtask-starvation':
      return stepMicrotaskStarvation(state);
    case 'multiple-task-sources':
      return stepMultipleTaskSources(state);
  }
}

export function chooseRunnableTask(
  state: EventLoopState,
  choiceId: string,
): EventLoopState {
  if (state.status !== 'scheduler-choice') {
    throw new Error('There is no valid scheduler choice in the current state.');
  }

  const choice = state.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) {
    throw new Error(`"${choiceId}" is not a valid scheduler choice.`);
  }

  const queue = state.runnableTasksBySource[choice.source] ?? [];
  const selected = queue.find((item) => item.id === choice.id);
  if (!selected) {
    throw new Error(`"${choiceId}" is not a valid scheduler choice.`);
  }

  return {
    ...state,
    current: selected,
    runnableTasksBySource: {
      ...state.runnableTasksBySource,
      [choice.source]: queue.filter((item) => item.id !== choice.id),
    },
    choices: [],
    status: 'running-work',
    stepIndex: state.stepIndex + 1,
    explanation: `${choice.label} is one valid scheduling choice for this simplified scenario; the platform does not promise a universal cross-source FIFO order.`,
  };
}
