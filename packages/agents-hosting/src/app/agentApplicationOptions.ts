/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CloudAdapter } from '../cloudAdapter'
import { InputFileDownloader } from './inputFileDownloader'
import { TurnState } from './turnState'
import { Storage } from '../storage'
import { AuthorizationHandlers } from './oauth/authorization'

export interface AgentApplicationOptions<TState extends TurnState> {
  adapter?: CloudAdapter;
  agentAppId?: string;
  storage?: Storage;
  startTypingTimer: boolean;
  longRunningMessages: boolean;
  turnStateFactory: () => TState;
  fileDownloaders?: InputFileDownloader<TState>[];
  authorization?: AuthorizationHandlers;
}
