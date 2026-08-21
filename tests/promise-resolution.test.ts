import {
  createPromiseScenarioState,
  PROMISE_SCENARIOS,
  stepPromiseScenario,
  type PromiseResolutionState,
  type PromiseScenarioId,
} from '@/lib/learning/promise-resolution';
import { describe, expect, it } from 'vitest';

function runScenario(id: PromiseScenarioId) {
  let state = createPromiseScenarioState(id);

  for (let guard = 0; guard < 50 && !state.complete; guard += 1) {
    state = stepPromiseScenario(state);
  }

  return state;
}

function findPromise(state: PromiseResolutionState, id: string) {
  const promise = state.promises.find(
    (candidate: { id: string }) => candidate.id === id,
  );
  if (!promise) throw new Error(`Missing promise ${id}`);
  return promise;
}

describe('promise resolution teaching model', () => {
  it('fulfills a downstream promise when a handler returns a plain value', () => {
    const state = runScenario('return-value');

    expect(findPromise(state, 'P1')).toMatchObject({
      state: 'fulfilled',
      resolution: 'fulfilled-value',
      value: '20',
    });
    expect(state.complete).toBe(true);
  });

  it('rejects a downstream promise when a handler throws', () => {
    const state = runScenario('throw-error');

    expect(findPromise(state, 'P1')).toMatchObject({
      state: 'rejected',
      resolution: 'rejected-reason',
      reason: 'boom',
    });
    expect(state.complete).toBe(true);
  });

  it('represents resolved-but-pending adoption before the adopted promise settles', () => {
    let state = createPromiseScenarioState('adopt-pending');
    let sawPendingAdoption = false;

    for (let guard = 0; guard < 50 && !state.complete; guard += 1) {
      state = stepPromiseScenario(state);
      const downstream = findPromise(state, 'P1');

      if (
        downstream.state === 'pending' &&
        downstream.resolution === 'adopting' &&
        downstream.adopts === 'P2'
      ) {
        sawPendingAdoption = true;
      }
    }

    expect(sawPendingAdoption).toBe(true);
    expect(findPromise(state, 'P1')).toMatchObject({
      state: 'fulfilled',
      resolution: 'fulfilled-value',
      value: '42',
    });
    expect(findPromise(state, 'P2')).toMatchObject({
      state: 'fulfilled',
      value: '42',
    });
  });

  it('fulfills the promise returned by catch when the rejection handler recovers', () => {
    const state = runScenario('catch-recovery');

    expect(findPromise(state, 'P1')).toMatchObject({
      state: 'fulfilled',
      resolution: 'fulfilled-value',
      value: 'Guest',
    });
    expect(state.complete).toBe(true);
  });

  it('preserves the prior fulfillment through a successful finally handler', () => {
    const state = runScenario('finally-transparent');

    expect(findPromise(state, 'P1')).toMatchObject({
      state: 'fulfilled',
      resolution: 'fulfilled-value',
      value: '7',
    });
    expect(state.complete).toBe(true);
  });

  it('creates two independent downstream promises when then is called twice', () => {
    const state = runScenario('branching');
    const branchA = findPromise(state, 'P1');
    const branchB = findPromise(state, 'P2');

    expect(branchA).toMatchObject({ state: 'fulfilled', value: '11' });
    expect(branchB).toMatchObject({ state: 'fulfilled', value: '20' });
    expect(branchA.id).not.toBe(branchB.id);
    expect(state.complete).toBe(true);
  });

  it('terminates every predefined scenario within the model guard', () => {
    for (const scenario of PROMISE_SCENARIOS) {
      expect(runScenario(scenario.id).complete).toBe(true);
    }
  });
});
