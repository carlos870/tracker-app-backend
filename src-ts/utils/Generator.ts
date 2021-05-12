import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

export const generateId = (size = 6) => {
    const nanoId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', size);

    return nanoId();
};

export const generateToken = (...params: string[]) => {
    return crypto
        .createHash('sha512')
        .update(params.join(':'))
        .digest('hex');
};