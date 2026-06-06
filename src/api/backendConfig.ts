export const DEFAULT_API_BASE_URL = "http://127.0.0.1:3333";

type PublicEnvironment = Record<string, string | undefined>;

export function getApiBaseUrl(
  environment: PublicEnvironment = process.env,
): string {
  const configuredUrl = environment.EXPO_PUBLIC_API_BASE_URL?.trim();
  return (configuredUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function isMockFallbackEnabled(
  configuredValue = process.env.EXPO_PUBLIC_ENABLE_MOCK_FALLBACK,
): boolean {
  return configuredValue?.trim().toLowerCase() === "true";
}
