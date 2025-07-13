import { logger } from "@/logger";
import "server-only";
import { z } from "zod";
import { ClientError } from "../actions";

/**
 * Custom validation error class for better error handling
 */
export class ValidationError extends ClientError {
  public readonly issues: z.core.$ZodIssue[];

  constructor(
    message: string,
    issues: z.core.$ZodIssue[],
    messageTranslationCode: string = "badRequest",
  ) {
    super(message, messageTranslationCode);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/**
 * Formats Zod validation errors into a human-readable message
 */
function formatValidationErrors(issues: z.core.$ZodIssue[]): string {
  if (issues.length === 0) return "Unknown validation error";

  if (issues.length === 1) {
    const issue = issues[0];
    const path = issue.path.length > 0 ? ` at ${issue.path.join(".")}` : "";
    return `${issue.message}${path}`;
  }

  return `Multiple validation errors: ${issues
    .map(issue => {
      const path = issue.path.length > 0 ? ` (${issue.path.join(".")})` : "";
      return `${issue.message}${path}`;
    })
    .join(", ")}`;
}

/**
 * Wrapper function that validates arguments using Zod schema before executing the action
 * @param action - The function to wrap with validation
 * @param zodSchema - The Zod schema to validate arguments against
 * @param actionName - Optional name for logging purposes
 * @returns A wrapped function that validates arguments before execution
 */
export function withActionValidator<T extends any[], U>(
  action: (...args: T) => Promise<U>,
  zodSchema: z.ZodType<T>,
) {
  return async (...args: T): Promise<U> => {
    const name = action.name || "unknown action";

    try {
      const validationResult = zodSchema.safeParse(args);

      if (!validationResult.success) {
        const errorMessage = formatValidationErrors(validationResult.error.issues);

        throw new ValidationError(errorMessage, validationResult.error.issues);
      }

      return await action(...validationResult.data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      logger.error(`Unexpected error in validator for ${name}`, {
        actionName: name,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  };
}
