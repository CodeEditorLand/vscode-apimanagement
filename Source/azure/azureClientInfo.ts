/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Environment } from "@azure/ms-rest-azure-env";
import type { TokenCredentialsBase } from "@azure/ms-rest-nodeauth";

export interface IAzureClientInfo {
	credentials: TokenCredentialsBase;
	subscriptionId: string;
	environment: Environment;
}
