export const runtimeConfig = __DAEDALUS_RUNTIME_CONFIG__;

export function hasDeepSeekKey() {
  return Boolean(runtimeConfig.deepseekApiKey);
}

export function shouldUseServerProxy() {
  return Boolean(runtimeConfig.useServerProxy);
}
