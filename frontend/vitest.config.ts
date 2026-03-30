import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
    test: {
        environment: "happy-dom",
        reporters: ["verbose"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json"],
        },
    },
});
