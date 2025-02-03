/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

import { MessagingExtensionParameter } from './messagingExtensionParameter'
import { MessagingExtensionQueryOptions } from './messagingExtensionQueryOptions'

export interface MessagingExtensionQuery {
  commandId?: string
  parameters?: MessagingExtensionParameter[]
  queryOptions?: MessagingExtensionQueryOptions
  state?: string
}
