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