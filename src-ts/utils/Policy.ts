export enum Effect {
    allow = 'Allow',
    deny = 'Deny'
};

interface IPolicyStatement {
    Action: string;
    Effect: string;
    Resource: string;
};

interface IPolicyDocument {
    Version: string;
    Statement: IPolicyStatement[];
};

interface IPolicy {
    principalId: string;
    policyDocument: IPolicyDocument;
    context?: object
};

/**
 * Generates a new policy to be used by AWS, allowing or denying access to the Invoke api action.
 * 
 * @param principalId The ID of the entity this policy should apply to.
 * @param effect The effect being applied.
 * @returns The policy document.
 */
export default function generate(principalId: string, effect: Effect): IPolicy {
    const policy = {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: '*'
                }
            ]
        }
    };

    return policy;
};