/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IServiceTreeRoot } from "./IServiceTreeRoot";

export interface IApiTreeRoot extends IServiceTreeRoot {
	apiName: string;
}
