// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CacheInfo, TaskModuleResponseBase } from '@microsoft/agents-bot-hosting/dist/src/teams'

// import { CacheInfo, TaskModuleResponseBase } from '@microsoft/agents-bot-hosting'

export interface TaskModuleResponse {
  task?: TaskModuleResponseBase
  cacheInfo?: CacheInfo
}
