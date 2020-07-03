import { getMedian, getCapitalizedString } from '../../src/util/helpers';

describe('helpers tests', () => {
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

    test('getCapitalizedString returns capitalized string', () => {
        const testString = 'test';

        const result = getCapitalizedString(testString);

        expect(result).toBe('Test');
    });

    test('getCapitalizedString returns capitalization on the first word only', () => {
        const testString = 'test test';

        const result = getCapitalizedString(testString);

        expect(result).toBe('Test test');
    });

    test('getCapitalizedString returns empty for empty input', () => {
        const testString = '';

        const result = getCapitalizedString(testString);

        expect(result).toBe('');
    });

    test('getCapitalizedString returns capitalization for already capitalized string', () => {
        const testString = 'Test';

        const result = getCapitalizedString(testString);

        expect(result).toBe('Test');
    });

    test('getCapitalizedString returns capitalization for all uppercase', () => {
        const testString = 'TEST';

        const result = getCapitalizedString(testString);

        expect(result).toBe('Test');
    });

    test('getCapitalizedString returns capitalization for non-capitalizable characters', () => {
        const testString = '.test';

        const result = getCapitalizedString(testString);

        expect(result).toBe('.test');
    });

    test('getCapitalizedString returns capitalization for single character', () => {
        const testString = 't';

        const result = getCapitalizedString(testString);

        expect(result).toBe('T');
    });
});
