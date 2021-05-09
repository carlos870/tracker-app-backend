import crypto from 'crypto';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export const generateId = nanoid;

export const generateToken = (journeyId: string, accessCode: string) => {
    const str = journeyId + ':' + accessCode;

    return crypto.createHash('sha512').update(str).digest('hex');
}