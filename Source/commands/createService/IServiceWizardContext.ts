/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { ApiManagementClient } from "@azure/arm-apimanagement";
import type { ApiManagementServiceResource } from "@azure/arm-apimanagement/src/models";
import type { IResourceGroupWizardContext } from "vscode-azureextensionui";

export interface IServiceWizardContext extends IResourceGroupWizardContext {
	client: ApiManagementClient;
	sku?: string;
	email?: string;
	serviceName?: string;
	service?: ApiManagementServiceResource;
}
