import Policy, { Effect } from '../../src-ts/utils/Policy';

test('Asserts that the generated policy matches the Allow effect.', () => {
    const testId = 'test';

    const result = Policy(testId, Effect.allow);

    expect(result).toHaveProperty('principalId', testId);
    expect(result).toHaveProperty(['policyDocument', 'Statement', 0, 'Effect'], Effect.allow);
});

test('Asserts that the generated policy matches the Deny effect.', () => {
    const testId = 'test';

    const result = Policy(testId, Effect.deny);

    expect(result).toHaveProperty('principalId', testId);
    expect(result).toHaveProperty(['policyDocument', 'Statement', 0, 'Effect'], Effect.deny);
});