import { ErrorDefinitions } from "./error-messages";
import { SuccessDefinitions } from "./success-messages";
import { WarningDefinitions } from "./warning-messages";
import { AppMessageCode, AppMessageDefinition, LocalizationKey } from "./types";

export * from "./types";

export const AppMessages: Record<AppMessageCode, AppMessageDefinition> = {
  ...ErrorDefinitions,
  ...SuccessDefinitions,
  ...WarningDefinitions,
} as Record<AppMessageCode, AppMessageDefinition>;

export const getAppMessageDefinition = (
  code: AppMessageCode | string
): AppMessageDefinition => {
  return (
    AppMessages[code as AppMessageCode] ||
    AppMessages[AppMessageCode.UNKNOWN_ERROR]
  );
};

// Type for dictionary - supports nested objects
type Dictionary = Record<string, Record<string, any>>;

/**
 * Resolves a localization key to its translated value
 * @param key - The localization key (e.g., "messages.successPrediction.title")
 * @param dictionary - The dictionary object containing translations
 * @returns The translated string or the key itself if not found
 */
export const resolveLocalization = (
  key: LocalizationKey,
  dictionary: Dictionary
): string => {
  const keys = key.split(".");
  let value: any = dictionary;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  return typeof value === "string" ? value : key;
};

/**
 * Gets the localized title for an app message
 * @param code - The message code
 * @param dictionary - The dictionary object containing translations
 * @returns The localized title
 */
export const getLocalizedTitle = (
  code: AppMessageCode,
  dictionary: Dictionary
): string => {
  const definition = getAppMessageDefinition(code);
  return resolveLocalization(definition.title, dictionary);
};

/**
 * Gets the localized description for an app message
 * @param code - The message code
 * @param dictionary - The dictionary object containing translations
 * @returns The localized description
 */
export const getLocalizedDescription = (
  code: AppMessageCode,
  dictionary: Dictionary
): string => {
  const definition = getAppMessageDefinition(code);
  return resolveLocalization(definition.description, dictionary);
};
