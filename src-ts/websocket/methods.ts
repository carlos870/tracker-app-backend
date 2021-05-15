import {
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
    PostToConnectionCommandInput,
    ServiceInputTypes,
    ServiceOutputTypes
} from '@aws-sdk/client-apigatewaymanagementapi';

import {
    FinalizeHandler,
    FinalizeHandlerArguments,
    HandlerExecutionContext
} from '@aws-sdk/types';

import { fromUtf8 } from '@aws-sdk/util-utf8-node';
import { HttpRequest } from '@aws-sdk/protocol-http';

import { IConnection, IMessage } from './models';
import { IJourneyId } from '../journey/models';
import { addNewConnection, removeConnection } from './db';

const WS_API = process.env.WS_API;
const WS_REGION = process.env.AWS_REGION;
const STAGE_NAME = process.env.API_STAGE_NAME;

const apiClient = new ApiGatewayManagementApiClient({
    region: WS_REGION,
    endpoint: `https://${WS_API}.execute-api.${WS_REGION}.amazonaws.com/${STAGE_NAME}/@connections`
});

// HACK, remove when its fixed on aws-sdk
apiClient.middlewareStack.addRelativeTo(
    (next: FinalizeHandler<ServiceInputTypes, ServiceOutputTypes>, context: HandlerExecutionContext) => {
        return async function (args: FinalizeHandlerArguments<ServiceInputTypes>) {
            if (!HttpRequest.isInstance(args.request)) return next(args);
            let prefixedRequest = args.request.clone();
            if (!prefixedRequest.path.startsWith(`/${STAGE_NAME}`)) {
                prefixedRequest.path = `/${STAGE_NAME}${args.request.path}`;
            }
            return await next({
                ...args,
                request: prefixedRequest
            });
        };
    },
    {
        relation: 'before',
        toMiddleware: 'awsAuthMiddleware'
    }
);
// HACK, remove when its fixed on aws-sdk

export async function registerConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    const newConnectionObj: IConnection = {
        ...connectionObj,
        registerDate: new Date()
    };

    await addNewConnection(newConnectionObj, journeyObj);

    console.log(`Connection [${connectionObj.connectionId}] registered for journey [${journeyObj.journeyId}].`);

    return true;
};

export async function unregisterConnection(connectionObj: IConnection, journeyObj: IJourneyId) {
    await removeConnection(connectionObj, journeyObj);

    console.log(`Connection [${connectionObj.connectionId}] unregistered from journey [${journeyObj.journeyId}].`);

    return true;
};

export async function publishNotification(messageObj: IMessage) {
    const { connectionId, data } = messageObj;

    console.log(`Publishing [${JSON.stringify(data)}] to connection [${connectionId}].`);

    const params: PostToConnectionCommandInput = {
        ConnectionId: connectionId,
        Data: fromUtf8(JSON.stringify(data))
    };

    await apiClient.send(new PostToConnectionCommand(params));

    return true;
};