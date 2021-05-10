enum Effect {
    allow = 'Allow',
    deny = 'Deny'
}

function generate(principalId: string, effect: string) {
    let authResponse: any = {
        principalId: principalId
    };

    let policyDocument: any = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];

    let statementOne: any = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = '*';
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;

    return authResponse;
}

export const allow = (principalId: string) => generate(principalId, Effect.allow);
export const deny = (principalId: string) => generate(principalId, Effect.deny);