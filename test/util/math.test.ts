import { getMedian } from '../../src/util/math';

describe('math tests', () => {
    test('getMedian returns median', () => {
        const testNumbers = [1, 2, 3];

        const result = getMedian(testNumbers);

        expect(result).toBe(2);
    });
    test('getMedian returns median with array length 2', () => {
        const testNumbers = [1, 2];

        const result = getMedian(testNumbers);

        expect(result).toBe(1.5);
    });
    test('getMedian returns median with even amount of numbers', () => {
        const testNumbers = [1, 2, 3, 4];

        const result = getMedian(testNumbers);

        expect(result).toBe(2.5);
    });
    test('getMedian returns median with array length 1', () => {
        const testNumbers = [1];

        const result = getMedian(testNumbers);

        expect(result).toBe(1);
    });
    test('getMedian returns median with array length 0', () => {
        const testNumbers = [];

        const result = getMedian(testNumbers);

        expect(result).toBe(0);
    });
});
