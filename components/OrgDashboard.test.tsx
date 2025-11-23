import { render, screen } from '@testing-library/react';
import { OrgDashboard } from './OrgDashboard';
import { expect, test, vi } from 'vitest';

// Mock ResponsiveContainer to prevent errors in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => children,
    ScatterChart: ({ children }) => children,
    Scatter: ({ children }) => children,
    XAxis: () => null,
    YAxis: () => null,
    ZAxis: () => null,
    Tooltip: () => null,
    Cell: () => null,
    ReferenceLine: () => null,
}));


test('renders OrgDashboard and generates a relative embed URL', () => {
  render(<OrgDashboard />);

  const embedCodeElement = screen.getByText(/<iframe/);
  const embedCode = embedCodeElement.textContent || '';

  const srcMatch = embedCode.match(/src="([^"]*)"/);
  const srcUrl = srcMatch ? srcMatch[1] : '';

  expect(srcUrl).not.toContain('https://kai-platform.com');
  expect(srcUrl.startsWith('?')).toBe(true);
});
