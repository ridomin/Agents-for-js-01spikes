/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AdaptiveCardAuthentication } from './adaptiveCardAuthentication'
import { AdaptiveCardInvokeAction } from './adaptiveCardInvokeAction'

export interface AdaptiveCardInvokeValue {
  action: AdaptiveCardInvokeAction
  authentication: AdaptiveCardAuthentication
  state: string
}
