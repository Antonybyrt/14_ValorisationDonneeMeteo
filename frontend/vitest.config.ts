import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
    test: {
        environment: "nuxt",
        reporters: ["verbose"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json"],
        },
    },
});
