/**
 * Template interpolation engine for workflow node variables.
 *
 * Supports two syntaxes:
 *   {{variableName.path.to.value}}      — resolves to the value (stringified if primitive)
 *   {{json variableName.path.to.value}} — resolves and JSON.stringify's the result
 */

function resolvePath(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

export function interpolate(
  template: string,
  context: Record<string, unknown>,
): string {
  // Match {{json path}} and {{path}}
  return template.replace(
    /\{\{\s*(json\s+)?(.+?)\s*\}\}/g,
    (_match, jsonFlag, path) => {
      const value = resolvePath(context, path.trim());

      if (value === undefined || value === null) {
        return "";
      }

      if (jsonFlag) {
        return JSON.stringify(value);
      }

      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch {
          return "[Object]";
        }
      }

      return String(value);
    },
  );
}
