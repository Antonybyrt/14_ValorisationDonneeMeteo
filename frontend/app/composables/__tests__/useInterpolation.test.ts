import { describe, expect, it } from "vitest";
import type { NationalIndicatorDataPoint } from "../../types/api";
import { insertCrossingPoints } from "../useInterpolation";

const makePoint = (
    date: string,
    temperature: number,
    baseline_mean: number,
): NationalIndicatorDataPoint => ({
    date,
    temperature,
    baseline_mean,
    baseline_std_dev_upper: baseline_mean + 1,
    baseline_std_dev_lower: baseline_mean - 1,
    baseline_max: baseline_mean + 2,
    baseline_min: baseline_mean - 2,
});

describe("insertCrossingPoints", () => {
    it("returns the same series when fewer than 2 points", () => {
        const single = [makePoint("2024-01-01", 15, 14)];
        expect(insertCrossingPoints(single)).toHaveLength(1);
    });

    it("returns same series when no crossing occurs", () => {
        const series = [
            makePoint("2024-01-01", 15, 14), // above baseline
            makePoint("2024-01-02", 16, 14), // still above
        ];
        expect(insertCrossingPoints(series)).toHaveLength(2);
    });

    it("inserts one crossing point when temperature crosses baseline", () => {
        const series = [
            makePoint("2024-01-01", 15, 14), // diff +1 (above)
            makePoint("2024-01-02", 13, 14), // diff -1 (below)
        ];
        const result = insertCrossingPoints(series);
        // original 2 + 1 interpolated crossing = 3
        expect(result).toHaveLength(3);
        // at the crossing point temperature must equal baseline_mean
        const crossing = result[1]!;
        expect(crossing.temperature).toBeCloseTo(crossing.baseline_mean, 10);
    });

    it("crossing point date falls between the two surrounding dates", () => {
        const series = [
            makePoint("2024-01-01", 15, 14),
            makePoint("2024-01-03", 13, 14),
        ];
        const result = insertCrossingPoints(series);
        const crossTime = new Date(result[1]!.date).getTime();
        expect(crossTime).toBeGreaterThan(new Date("2024-01-01").getTime());
        expect(crossTime).toBeLessThan(new Date("2024-01-03").getTime());
    });

    it("handles multiple crossings in a longer series", () => {
        const series = [
            makePoint("2024-01-01", 15, 14), // above
            makePoint("2024-01-02", 13, 14), // below → crossing inserted
            makePoint("2024-01-03", 16, 14), // above → crossing inserted
        ];
        const result = insertCrossingPoints(series);
        // 3 original + 2 crossings = 5
        expect(result).toHaveLength(5);
    });
});
