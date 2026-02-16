// Random Consistency Index (RI) values for n=1 to 10
export const RI_VALUES = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

/**
 * Normalizes a pairwise comparison matrix and calculates the priority vector (weights).
 */
export function calculatePriorities(matrix: number[][]): number[] {
    const n = matrix.length;
    const colSums = new Array(n).fill(0);

    // Sum columns
    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            colSums[j] += matrix[i][j];
        }
    }

    // Normalize matrix and calculate row averages
    const priorities = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let rowSumOfNormalized = 0;
        for (let j = 0; j < n; j++) {
            rowSumOfNormalized += matrix[i][j] / colSums[j];
        }
        priorities[i] = rowSumOfNormalized / n;
    }

    return priorities;
}

/**
 * Calculates the Consistency Ratio (CR) of a pairwise comparison matrix.
 * CR < 0.1 is generally considered acceptable.
 */
export function calculateConsistencyRatio(matrix: number[][], priorities: number[]) {
    const n = matrix.length;
    if (n <= 2) return { cr: 0, isConsistent: true };

    // 1. Calculate weighted sum vector (Ax)
    const weightedSum = matrix.map((row) =>
        row.reduce((sum, val, j) => sum + val * priorities[j], 0)
    );

    // 2. Estimate lambda_max (average of (Ax)_i / x_i)
    const lambdaMax = weightedSum.reduce((sum, val, i) => sum + val / priorities[i], 0) / n;

    // 3. Consistency Index (CI)
    const ci = (lambdaMax - n) / (n - 1);

    // 4. Consistency Ratio (CR)
    const ri = RI_VALUES[n - 1]; // Index adjustment for 1-based n
    const cr = ri === 0 ? 0 : ci / ri;

    return {
        lambdaMax,
        ci,
        cr,
        isConsistent: cr < 0.1,
    };
}

/**
 * Converts a slider value (1/9 to 9) to the actual matrix value.
 * Slider range typically -8 to 8 or something similar.
 * 0 -> 1
 * 8 -> 9
 * -8 -> 1/9
 */
export function sliderToMatValue(value: number): number {
    if (value === 0) return 1;
    if (value > 0) return value + 1;
    return 1 / (Math.abs(value) + 1);
}
