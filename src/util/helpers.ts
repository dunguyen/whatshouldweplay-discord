export const getMedian = function (numbers: number[]): number {
    if (numbers.length === 0) {
        return 0;
    }
    const half = Math.floor(numbers.length / 2);

    numbers.sort();
    if (numbers.length % 2) {
        return numbers[half];
    } else {
        return (numbers[half - 1] + numbers[half]) / 2.0;
    }
};

export const getCapitalizedString = function (str: string): string {
    if (!str) {
        return '';
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
