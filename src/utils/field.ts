import { FormInstance } from "element-plus/es/components/form";

export function clearFieldError(
  formRef: FormInstance | null | undefined,
  rules: any,
  field: string
) {
  if (formRef) {
    formRef.clearValidate([field]);
  }

  if (rules[field]) {
    rules[field] = rules[field].filter(
      (rule: any) =>
        !Object.prototype.hasOwnProperty.call(rule, "validator") ||
        !(rule.validator instanceof Function)
    );
  }
}

export function clearAllCustomValidators(rules: any) {
  Object.keys(rules).forEach((field) => {
    if (rules[field]) {
      rules[field] = rules[field].filter(
        (rule: any) =>
          !Object.prototype.hasOwnProperty.call(rule, "validator") ||
          !(rule.validator instanceof Function)
      );
    }
  });
}

export function updateValidationRules(
  formRef: FormInstance | null | undefined,
  rules: any,
  errors: Record<string, string>
) {
  if (!formRef || !errors) return;

  for (const [field, message] of Object.entries(errors)) {
    const oldRules = Array.isArray(rules[field]) ? rules[field] : [];
    rules[field] = [
      ...oldRules,
      {
        validator: () => new Error(message),
        trigger: "blur",
      },
    ];

    formRef?.validateField(field);
  }
}
