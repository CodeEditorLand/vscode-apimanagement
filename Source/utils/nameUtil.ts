/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IApiTreeRoot } from "../explorer/IApiTreeRoot";
import type { IOperationTreeRoot } from "../explorer/IOperationTreeRoot";
import type { IProductTreeRoot } from "../explorer/IProductTreeRoot";
import type { IServiceTreeRoot } from "../explorer/IServiceTreeRoot";

export function nameUtil(
	root:
		| IServiceTreeRoot
		| IApiTreeRoot
		| IOperationTreeRoot
		| IProductTreeRoot,
): string {
	let name = root.serviceName;

	if (isProductRoot(root)) {
		name = `${name}-${root.productName}`;
	}

	if (isApiRoot(root)) {
		name = `${name}-${root.apiName}`;
	}

	if (isOperationRoot(root)) {
		name = `${name}-${root.opName}`;
	}

	return name;
}

function isApiRoot(
	root:
		| IServiceTreeRoot
		| IApiTreeRoot
		| IOperationTreeRoot
		| IProductTreeRoot,
): root is IApiTreeRoot {
	return (<IApiTreeRoot>root).apiName !== undefined;
}

function isOperationRoot(
	root:
		| IServiceTreeRoot
		| IApiTreeRoot
		| IOperationTreeRoot
		| IProductTreeRoot,
): root is IOperationTreeRoot {
	return (<IOperationTreeRoot>root).opName !== undefined;
}

function isProductRoot(
	root:
		| IServiceTreeRoot
		| IApiTreeRoot
		| IOperationTreeRoot
		| IProductTreeRoot,
): root is IProductTreeRoot {
	return (<IProductTreeRoot>root).productName !== undefined;
}
