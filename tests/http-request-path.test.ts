import { describe, expect, it } from 'vitest';
import {
  HTTP_REQUEST_PATH_SCENARIOS,
  getRequestPathScenario,
} from '@/lib/learning/http-request-path';

const ids = [
  'cold-request',
  'warm-connection',
  'fresh-cache-hit',
  'stale-cache-revalidation',
  'intermediary-cache-hit',
  'redirect',
] as const;

describe('HTTP request path scenarios', () => {
  it('defines exactly the six approved scenarios', () => {
    expect(HTTP_REQUEST_PATH_SCENARIOS.map((scenario) => scenario.id)).toEqual(ids);
  });

  it('fresh cache hit stops before network and origin work', () => {
    const scenario = getRequestPathScenario('fresh-cache-hit');
    const state = Object.fromEntries(
      scenario.stages.map((stage) => [stage.id, stage.state]),
    );

    expect(state['http-cache']).toBe('performed');
    expect(state.dns).toBe('skipped');
    expect(state['transport-connect']).toBe('skipped');
    expect(state.tls).toBe('skipped');
    expect(state['send-http']).toBe('skipped');
    expect(state.origin).toBe('skipped');
  });

  it('warm connection skips new setup but still sends HTTP', () => {
    const scenario = getRequestPathScenario('warm-connection');
    const state = Object.fromEntries(
      scenario.stages.map((stage) => [stage.id, stage.state]),
    );

    expect(state.dns).toBe('skipped');
    expect(state['transport-connect']).toBe('skipped');
    expect(state.tls).toBe('skipped');
    expect(state['send-http']).toBe('performed');
    expect(state.origin).toBe('performed');
  });

  it('stale-cache revalidation describes one conditional validation path', () => {
    const scenario = getRequestPathScenario('stale-cache-revalidation');

    expect(scenario.summary).toMatch(/conditional/i);
    expect(scenario.summary).toMatch(/304 Not Modified/i);
    expect(scenario.summary).toMatch(/this scenario|one possible/i);
  });

  it('intermediary cache hit stops before origin processing', () => {
    const scenario = getRequestPathScenario('intermediary-cache-hit');
    const origin = scenario.stages.find((stage) => stage.id === 'origin');

    expect(origin?.state).toBe('skipped');
  });

  it('redirect makes the follow-up request evaluate its path again', () => {
    const scenario = getRequestPathScenario('redirect');
    const follow = scenario.stages.find(
      (stage) => stage.id === 'follow-redirect',
    );

    expect(follow?.state).toBe('performed');
    expect(follow?.explanation).toMatch(/evaluat/i);
  });

  it('contains no invented duration fields', () => {
    expect(JSON.stringify(HTTP_REQUEST_PATH_SCENARIOS)).not.toMatch(
      /duration|latencyMs|timeMs/,
    );
  });
});
