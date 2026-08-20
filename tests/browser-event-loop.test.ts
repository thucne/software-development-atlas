import {
  chooseRunnableTask,
  createScenarioState,
  stepEventLoop,
} from '@/lib/learning/browser-event-loop';
import { describe, expect, it } from 'vitest';

function runDeterministicScenario(
  id: Parameters<typeof createScenarioState>[0],
) {
  let state = createScenarioState(id);

  for (let guard = 0; guard < 100 && !state.complete; guard += 1) {
    if (state.status === 'scheduler-choice') {
      throw new Error(`Scenario ${id} unexpectedly requires a scheduler choice`);
    }

    state = stepEventLoop(state);
  }

  return state;
}

function reachSchedulerChoice() {
  let state = createScenarioState('multiple-task-sources');

  for (
    let guard = 0;
    guard < 100 && state.status !== 'scheduler-choice';
    guard += 1
  ) {
    state = stepEventLoop(state);
  }

  return state;
}

describe('browser event-loop simulator', () => {
  it('runs synchronous output before Promise microtasks and timer tasks', () => {
    const state = runDeterministicScenario('promise-vs-timer');

    expect(state.output).toEqual(['A', 'B', 'promise', 'timer']);
    expect(state.complete).toBe(true);
  });

  it('drains a newly queued microtask during the same checkpoint', () => {
    const state = runDeterministicScenario('nested-microtasks');

    expect(state.output).toEqual(['script', 'microtask A', 'microtask B']);
    expect(state.complete).toBe(true);
  });

  it('runs a Promise reaction queued by a timer before later tasks proceed', () => {
    const state = runDeterministicScenario('timer-queues-promise');

    expect(state.output).toEqual([
      'script',
      'timer',
      'promise from timer',
      'later task',
    ]);
    expect(state.complete).toBe(true);
  });

  it('represents requestAnimationFrame inside rendering work', () => {
    const state = runDeterministicScenario('rendering-opportunity');

    expect(state.output).toContain('animation frame');
    expect(state.status).toBe('idle');
    expect(state.complete).toBe(true);
  });

  it('bounds recursive microtask production with an explicit warning', () => {
    const state = runDeterministicScenario('microtask-starvation');

    expect(
      state.output.filter((line) => line.startsWith('microtask')),
    ).toHaveLength(5);
    expect(state.explanation).toContain('Later tasks and rendering');
    expect(state.complete).toBe(true);
  });

  it('requires an explicit valid choice between unrelated runnable task sources', () => {
    let state = reachSchedulerChoice();

    expect(state.status).toBe('scheduler-choice');
    expect(state.choices.map((choice) => choice.source).sort()).toEqual([
      'timer',
      'user-interaction',
    ]);

    const timerChoice = state.choices.find(
      (choice) => choice.source === 'timer',
    );

    expect(timerChoice).toBeDefined();

    state = chooseRunnableTask(state, timerChoice!.id);
    expect(state.explanation).toContain('valid scheduling choice');
  });

  it.each(['timer', 'user-interaction'] as const)(
    'completes after choosing the %s source first',
    (source) => {
      let state = reachSchedulerChoice();
      const choice = state.choices.find((candidate) => candidate.source === source);

      expect(choice).toBeDefined();
      state = chooseRunnableTask(state, choice!.id);

      for (let guard = 0; guard < 20 && !state.complete; guard += 1) {
        state = stepEventLoop(state);
      }

      expect(state.complete).toBe(true);
      expect(state.status).toBe('idle');
      expect([...state.output].sort()).toEqual([
        'timer task',
        'user-interaction task',
      ]);
    },
  );

  it('rejects a scheduler choice that is not currently valid', () => {
    const state = reachSchedulerChoice();

    expect(() => chooseRunnableTask(state, 'not-a-valid-choice')).toThrow(
      /valid scheduler choice/i,
    );
  });
});
