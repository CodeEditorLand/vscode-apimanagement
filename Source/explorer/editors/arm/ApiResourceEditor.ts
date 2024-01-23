/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { ApiManagementModels } from "@azure/arm-apimanagement";
import type { AzureTreeItem } from "vscode-azureextensionui";
import type { IApiTreeRoot } from "../../IApiTreeRoot";
import { BaseArmResourceEditor } from "./BaseArmResourceEditor";

// tslint:disable-next-line:no-any
export class ApiResourceEditor extends BaseArmResourceEditor<IApiTreeRoot> {
	public entityType = "API";

	public async getDataInternal(
		context: AzureTreeItem<IApiTreeRoot>,
	): Promise<ApiManagementModels.ApiContract> {
		return await context.root.client.api.get(
			context.root.resourceGroupName,
			context.root.serviceName,
			context.root.apiName,
		);
	}

	public async updateDataInternal(
		context: AzureTreeItem<IApiTreeRoot>,
		payload: ApiManagementModels.ApiCreateOrUpdateParameter,
	): Promise<ApiManagementModels.ApiContract> {
		return await context.root.client.api.createOrUpdate(
			context.root.resourceGroupName,
			context.root.serviceName,
			context.root.apiName,
			payload,
		);
	}
}
