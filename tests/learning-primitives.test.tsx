import {
  LabControls,
  LabPanel,
  LabShell,
  LiveStatus,
  ScenarioSelect,
  ScrollableCodeRegion,
} from '@/components/learning/primitives';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

describe('learning primitives', () => {
  test('LabShell names its semantic section from its visible title', () => {
    const html = renderToStaticMarkup(
      <LabShell title="Example Lab" description="A teaching description">
        <p>Body</p>
      </LabShell>,
    );

    expect(html).toContain('<section');
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
    expect(html).toMatch(/<h3 id="[^"]+"[^>]*>Example Lab<\/h3>/);
    expect(html).toContain('A teaching description');
    expect(html).toContain('<p>Body</p>');
  });

  test('LabPanel is a titled semantic section', () => {
    const html = renderToStaticMarkup(
      <LabPanel title="Output log">
        <p>None</p>
      </LabPanel>,
    );

    expect(html).toContain('<section');
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
    expect(html).toMatch(/<h4 id="[^"]+"[^>]*>Output log<\/h4>/);
  });

  test('ScenarioSelect owns its label association and visible description', () => {
    const html = renderToStaticMarkup(
      <ScenarioSelect
        label="Promise scenario"
        value="one"
        options={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
        description="Current scenario description"
        onChange={() => {}}
      />,
    );

    const labelFor = html.match(/<label for="([^"]+)"/)?.[1];
    expect(labelFor).toBeTruthy();
    expect(html).toContain(`id="${labelFor}"`);
    expect(html).toContain('Promise scenario');
    expect(html).toContain('Current scenario description');
    expect(html).toMatch(/<option[^>]*value="one"[^>]*>One<\/option>/);
    expect(html).toMatch(/<option[^>]*value="two"[^>]*>Two<\/option>/);
  });

  test('ScrollableCodeRegion is named, focusable, and uses pre/code markup', () => {
    const html = renderToStaticMarkup(
      <ScrollableCodeRegion label="Scenario source">
        {'const value = 1;'}
      </ScrollableCodeRegion>,
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Scenario source"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('<pre');
    expect(html).toContain('<code>const value = 1;</code>');
  });

  test('LiveStatus uses polite announcements and preserves domain-owned children', () => {
    const html = renderToStaticMarkup(
      <LiveStatus label="Status">
        <span data-testid="domain-status">Idle</span>
      </LiveStatus>,
    );

    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('<strong>Status:</strong>');
    expect(html).toContain('data-testid="domain-status"');
    expect(html).toContain('Idle');
  });

  test('LabControls lays out caller-owned actions and trailing content', () => {
    const html = renderToStaticMarkup(
      <LabControls trailing={<span>Step 2</span>}>
        <button type="button">Step</button>
      </LabControls>,
    );

    expect(html).toContain('<button type="button">Step</button>');
    expect(html).toContain('Step 2');
  });
});
