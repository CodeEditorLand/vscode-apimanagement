/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeItem } from "vscode-azureextensionui";
import { treeUtils } from "../utils/treeUtils";
import type { IProductTreeRoot } from "./IProductTreeRoot";

export class ProductPolicyTreeItem extends AzureTreeItem<IProductTreeRoot> {
	public get iconPath(): { light: string; dark: string } {
		return treeUtils.getThemedIconPath("policy");
	}
	public static contextValue = "azureApiManagementProductPolicy";
	public label = "Policy";
	public contextValue: string = ProductPolicyTreeItem.contextValue;
	public readonly commandId: string = "azureApiManagement.showProductPolicy";
}
