import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

/**
 * Generates a random ID with the provided size.
 * 
 * @param size The length of the ID.
 * @returns A string with the generated ID.
 */
export const generateId = (size = 6) => {
    const nanoId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', size);

    return nanoId();
};

/**
 * Generates a token based on the provided string parameters.
 * 
 * @param params The strings to be hashed.
 * @returns A string with the generated token.
 */
export const generateToken = (...params: string[]) => {
    return crypto
        .createHash('sha512')
        .update(params.join(':'))
        .digest('hex');
};