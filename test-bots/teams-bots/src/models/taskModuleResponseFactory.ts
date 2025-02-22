// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { teams } from '@microsoft/agents-bot-hosting'

type TaskModuleTaskInfo = teams.TaskModuleTaskInfo
type TaskModuleResponse = teams.TaskModuleResponse

export class TaskModuleResponseFactory {
  static toTaskModuleResponse (taskInfo: TaskModuleTaskInfo): TaskModuleResponse {
    return TaskModuleResponseFactory.createResponse(taskInfo)
  }

  static createResponse (taskInfo: TaskModuleTaskInfo) {
    const taskModuleResponse: TaskModuleResponse = {
      task: {
        type: 'continue',
        value: taskInfo
      }
    }

    return taskModuleResponse
  }

  static createMessageResponse (message: string): TaskModuleResponse {
    const taskModuleResponse: TaskModuleResponse = {
      task: {
        type: 'message',
        value: message
      }
    }

    return taskModuleResponse
  }
}
