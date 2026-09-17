import { describe, expect, it } from 'vitest';
import { escapeCsvCell } from '@/lib/csv';

describe('CSV export security', () => {
  it('neutralises spreadsheet formula prefixes from public form fields', () => {
    for (const payload of ['=1+1', '+SUM(A1:A2)', '-2+3', '@IMPORTXML("https://example.test")', '  =cmd']) {
      expect(escapeCsvCell(payload)).toMatch(/^"\s*'/);
    }
  });

  it('still quotes commas and embedded double quotes', () => {
    expect(escapeCsvCell('hello, "world"')).toBe('"hello, ""world"""');
  });
});
