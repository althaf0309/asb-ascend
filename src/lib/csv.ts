/**
 * Quotes a CSV cell and neutralises spreadsheet formula prefixes. Public form
 * values are untrusted; surrounding a formula in quotes does not stop Excel or
 * other spreadsheet applications from evaluating it.
 */
export const escapeCsvCell = (value: unknown): string => {
  let safe = String(value ?? '');
  if (/^[\t\r\n ]*[=+\-@]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replace(/"/g, '""')}"`;
};
