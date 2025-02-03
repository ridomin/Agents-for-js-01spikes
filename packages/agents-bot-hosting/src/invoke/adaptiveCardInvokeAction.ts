/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface AdaptiveCardInvokeAction {
  type: string
  id: string
  verb: string
  data: Record<string, unknown>
}
