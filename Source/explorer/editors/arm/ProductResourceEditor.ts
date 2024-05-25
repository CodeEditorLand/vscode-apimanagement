/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { ApiManagementModels } from "@azure/arm-apimanagement";
import type { AzureTreeItem } from "vscode-azureextensionui";
import type { IProductTreeRoot } from "../../IProductTreeRoot";
import { BaseArmResourceEditor } from "./BaseArmResourceEditor";

// tslint:disable-next-line:no-any
export class ProductResourceEditor extends BaseArmResourceEditor<IProductTreeRoot> {
	public entityType = "Product";
	constructor() {
		super();
	}

	public async getDataInternal(
		context: AzureTreeItem<IProductTreeRoot>,
	): Promise<ApiManagementModels.ProductContract> {
		return await context.root.client.product.get(
			context.root.resourceGroupName,
			context.root.serviceName,
			context.root.productName,
		);
	}

	public async updateDataInternal(
		context: AzureTreeItem<IProductTreeRoot>,
		payload: ApiManagementModels.ProductContract,
	): Promise<ApiManagementModels.ProductContract> {
		return await context.root.client.product.createOrUpdate(
			context.root.resourceGroupName,
			context.root.serviceName,
			context.root.productName,
			payload,
		);
	}
}
