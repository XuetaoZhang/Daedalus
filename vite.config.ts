import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  const runtimeConfig = {
    deepseekApiKey:
      env["DEEPSEEK-API-KEY"] ||
      env.DEEPSEEK_API_KEY ||
      env.VITE_DEEPSEEK_API_KEY ||
      "",
    glmApiKey:
      env["GLM-API-KEY"] ||
      env.GLM_API_KEY ||
      env.VITE_GLM_API_KEY ||
      "",
    deepseekModel: env.DEEPSEEK_MODEL || env.VITE_DEEPSEEK_MODEL || "deepseek-chat",
    deepseekBaseUrl:
      env.DEEPSEEK_BASE_URL || env.VITE_DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    useServerProxy:
      (env.VITE_USE_SERVER_PROXY || "").toLowerCase() === "true" ||
      (!(
        env["DEEPSEEK-API-KEY"] ||
        env.DEEPSEEK_API_KEY ||
        env.VITE_DEEPSEEK_API_KEY
      ) &&
        mode !== "development"),
  };

  return {
    plugins: [react()],
    define: {
      __DAEDALUS_RUNTIME_CONFIG__: JSON.stringify(runtimeConfig),
    },
  };
});
