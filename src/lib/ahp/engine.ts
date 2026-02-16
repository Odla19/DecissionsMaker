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
            // Ensure value is a valid number, default to 1 if NaN or null
            const val = (matrix[i][j] && !isNaN(matrix[i][j])) ? matrix[i][j] : 1;
            colSums[j] += val;
        }
    }

    // Normalize matrix and calculate row averages
    const priorities = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let rowSumOfNormalized = 0;
        for (let j = 0; j < n; j++) {
            // Prevent division by zero if colSums[j] is 0
            const sum = colSums[j] || 1;
            const val = (matrix[i][j] && !isNaN(matrix[i][j])) ? matrix[i][j] : 1;
            rowSumOfNormalized += val / sum;
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
        row.reduce((sum, val, j) => {
            const safeVal = (val && !isNaN(val)) ? val : 1;
            return sum + safeVal * (priorities[j] || 0);
        }, 0)
    );

    // 2. Estimate lambda_max (average of (Ax)_i / x_i)
    const lambdaMax = weightedSum.reduce((sum, val, i) => {
        const priority = priorities[i] || (1 / n); // Prevent division by zero
        return sum + val / priority;
    }, 0) / n;

    // 3. Consistency Index (CI)
    const ci = (lambdaMax - n) / (n - 1);

    // 4. Consistency Ratio (CR)
    const ri = RI_VALUES[n - 1] || 1; // Index adjustment for 1-based n
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
 */
export function sliderToMatValue(value: number): number {
    if (isNaN(value) || value === null) return 1;
    if (value === 0) return 1;
    if (value > 0) return value + 1;
    return 1 / (Math.abs(value) + 1);
}
