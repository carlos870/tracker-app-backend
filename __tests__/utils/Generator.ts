import { generateId, generateToken } from '../../src-ts/utils/Generator';

test('Asserts that the generated token is correctly hashed for the provided parameters.', () => {
    const hash = '78a39c99c6f6488c9199e08c3ea57b234b629b6b15b193faacc11335a24e62498a9c2f352a7c0bac29aa310032c903ddc19960cbc82864747cce6b32958b65c9';
    const result = generateToken('some', 'test', 'value');

    expect(result).toBe(hash);
});

test('Asserts that the generated ID has the required length.', () => {
    const result = generateId(3);

    expect(result).toHaveLength(3);
});

test('Asserts that the generated ID has a default length of 6.', () => {
    const result = generateId();

    expect(result).toHaveLength(6);
});