import { useState, useCallback } from "react";
import { z, ZodSchema } from "zod";

type ValidationErrors<T> = Partial<Record<keyof T, string>>;

interface UseValidationReturn<T> {
  errors: ValidationErrors<T>;
  validate: (data: T) => boolean;
  validateField: (field: keyof T, value: any) => boolean;
  clearErrors: () => void;
  setErrors: (errors: ValidationErrors<T>) => void;
}

/**
 * A custom hook that acts as a Validation Engine using Zod schemas.
 *
 * @param schema The Zod schema to validate against
 * @returns Validation methods and error state
 */
export function useValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>
): UseValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  const validate = useCallback(
    (data: T): boolean => {
      try {
        schema.parse(data);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedErrors: ValidationErrors<T> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              formattedErrors[err.path[0] as keyof T] = err.message;
            }
          });
          setErrors(formattedErrors);
        }
        return false;
      }
    },
    [schema]
  );

  const validateField = useCallback(
    (field: keyof T, value: any): boolean => {
      try {
        // Create a partial schema for just this field
        // This assumes the schema is a ZodObject.
        // If it's a refinement or effect, this might be tricky,
        // but for standard form schemas it works well.
        if (schema instanceof z.ZodObject) {
          const fieldSchema = schema.shape[field as string];
          if (fieldSchema) {
            fieldSchema.parse(value);
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[field];
              return newErrors;
            });
            return true;
          }
        }
        // Fallback: parse entire object if possible, or just ignore field validation if complex
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [field]: error.errors[0]?.message || "Invalid value",
          }));
        }
        return false;
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    setErrors,
  };
}
