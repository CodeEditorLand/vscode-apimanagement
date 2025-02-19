/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { ApiContract, ApiCreateOrUpdateParameter, ApiReleaseContract } from "@azure/arm-apimanagement/src/models";
import { Guid } from "guid-typescript";
import { MessageItem, ProgressLocation, window } from "vscode";
import { IActionContext } from "@microsoft/vscode-azext-utils";
import { ApiTreeItem } from "../explorer/ApiTreeItem";
import { ext } from "../extensionVariables";
import { localize } from "../localize";
import { nonNullOrEmptyValue } from "../utils/nonNull";
import { uiUtils } from "@microsoft/vscode-azext-azureutils";
import { ApiRevisionContract } from "@azure/arm-apimanagement";

// tslint:disable: no-non-null-assertion
export async function revisions(context: IActionContext, node?: ApiTreeItem): Promise<void> {
    if (node === undefined) {
        node = <ApiTreeItem>await ext.tree.showTreeItemPicker(ApiTreeItem.contextValue, context);
    }

    const options = [localize("", "Make Current"), localize("", "Switch Revision"), localize("", "Create Revision"), localize("", "Delete Revision")];
    const commands = await context.ui.showQuickPick(options.map((s) => { return { label: s }; }), { canPickMany: false });

    if (commands.label === localize("", "Switch Revision")) {
        const pickedApi = await listRevisions(context, node);

        await node.reloadApi(pickedApi);
        await node.refresh(context);
        window.showInformationMessage(localize("switchRevisions", `Switched to revision ${pickedApi.name!} sucecessfully.`));

    } else if (commands.label === localize("", "Make Current")) {
        if (node!.apiContract.isCurrent) {
            window.showInformationMessage(localize("releaseRev", 'This revision is already current.'));
        } else {
            const yes: MessageItem = { title: localize('Yes', "Yes") };
            const no: MessageItem = { title: localize('No', "No") };
            const message: string = localize('shouldRelease', `You are currently on ${node!.apiContract.name!}. This revision will become the public implementation of your API. Are you sure you want to continue?`);
            const result = await window.showInformationMessage(message, yes, no);
            if (result === yes) {
                await window.withProgress(
                    {
                        location: ProgressLocation.Notification,
                        title: localize("releasing", "Releasing API Revision..."),
                        cancellable: false
                    },
                    async () => {
                        const apiRevName = node!.apiContract.name!;
                        const notes = await askReleaseNotes(context);
                        const apiRelease: ApiReleaseContract = {
                            apiId: "/apis/".concat(apiRevName),
                            notes: notes
                        };
                        const pickedApiName = node!.root.apiName.split(";rev=")[0];
                        const releaseId = Guid.create().toString();
                        await node!.root.client.apiRelease.createOrUpdate(node!.root.resourceGroupName, node!.root.serviceName, pickedApiName, releaseId, apiRelease);
                        const api = await node!.root.client.api.get(node!.root.resourceGroupName, node!.root.serviceName, node!.root.apiName);
                        await node!.reloadApi(api);
                        await node!.refresh(context);
                    }
                ).then(async () => {
                    window.showInformationMessage(localize("releaseRevision", "Releasing current revision has been completed successfully."));
                });
            }
        }
    } else if (commands.label === localize("", "Create Revision")) {
        await createRevision(context, node);
    } else if (commands.label === localize("", "Delete Revision")) {
        await deleteRevision(context, node);
    }
}

async function askReleaseNotes(context: IActionContext): Promise<string> {
    const releaseNotesPrompt: string = localize('namespacePrompt', 'Enter release notes.');
    const defaultName = localize('releaseName', "New release");
    return (await context.ui.showInputBox({
        prompt: releaseNotesPrompt,
        value: defaultName,
        validateInput: async (value: string | undefined): Promise<string | undefined> => {
            value = value ? value.trim() : '';
            return undefined;
        }
    })).trim();
}

async function listRevisions(context: IActionContext, node: ApiTreeItem): Promise<ApiContract> {
    const nodeApiName = node.root.apiName.split(";rev=")[0];
    const apiRevisions: ApiRevisionContract[] = await uiUtils.listAllIterator(node.root.client.apiRevision.listByService(node.root.resourceGroupName, node.root.serviceName, nodeApiName));
    const apiIds = apiRevisions.map((s) => {
        return s.isCurrent !== undefined && s.isCurrent === true ? s.apiId!.concat("(Current)") : s.apiId!;
    });
    const pickedApiRevision = await context.ui.showQuickPick(apiIds.map((s) => { return { label: s }; }), { canPickMany: false });
    const apiName = pickedApiRevision.label.replace("/apis/", "").replace("(Current)", "");
    return await node.root.client.api.get(node.root.resourceGroupName, node.root.serviceName, apiName);
}

async function createRevision(context: IActionContext, node: ApiTreeItem): Promise<void> {
    await window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: localize("creating", "Creating API revision..."),
            cancellable: true
        },
        async () => {
            const curApi = await node.root.client.api.get(node.root.resourceGroupName, node.root.serviceName, node.root.apiName);
            const revs = await uiUtils.listAllIterator(node.root.client.apiRevision.listByService(node.root.resourceGroupName, node.root.serviceName, node.root.apiName));
            const apiRevisions = revs.map((s) => {return s; });
            let revNumber = 0;
            for (const apiRev of apiRevisions) {
                if (apiRev.apiRevision !== undefined && Number(apiRev.apiRevision) > revNumber) {
                    revNumber = Number(apiRev.apiRevision);
                }
            }
            const revDescription = await askRevisionDescription(context);
            const newApiRev : ApiCreateOrUpdateParameter = {
                sourceApiId: "/apis/".concat(curApi.id!),
                apiRevisionDescription: revDescription,
                path: curApi.path,
                isCurrent: false
            };
            curApi.apiRevision = (revNumber + 1).toString();
            curApi.apiRevisionDescription = revDescription;
            curApi.isCurrent = false;
            curApi.sourceApiId =  "/apis/".concat(curApi.id!);
            const apiRevId = node.root.apiName.concat(";rev=", (revNumber + 1).toString());
            const resApi = await node.root.client.api.beginCreateOrUpdateAndWait(node.root.resourceGroupName, node.root.serviceName, apiRevId, newApiRev);
            await node.reloadApi(resApi);
            await node.refresh(context);
        }
    ).then(async () => {
        window.showInformationMessage(localize("createRevision", "New revision has been created successfully."));
    });
}

async function deleteRevision(context: IActionContext, node: ApiTreeItem): Promise<void> {
    await window.withProgress(
        {
            location: ProgressLocation.Notification,
            title: localize("deleting", "Deleting API Revision..."),
            cancellable: true
        },
        async () => {
            const pickedApi = await listRevisions(context, node);
            await node.root.client.api.delete(node.root.resourceGroupName, node.root.serviceName, nonNullOrEmptyValue(pickedApi.name), "*");
        }
    ).then(async () => {
        window.showInformationMessage(localize("deleteRevision", "Delete revision has completed successfully."));
    });
}

async function askRevisionDescription(context: IActionContext): Promise<string> {
    const releaseNotesPrompt: string = localize('revisionPrompt', 'Enter revision description.');
    const defaultDescription: string = localize('revisionPrompt',  "New API revision");
    return (await context.ui.showInputBox({
        prompt: releaseNotesPrompt,
        value: defaultDescription,
        validateInput: async (value: string | undefined): Promise<string | undefined> => {
            value = value ? value.trim() : '';
            return undefined;
        }
    })).trim();
}
