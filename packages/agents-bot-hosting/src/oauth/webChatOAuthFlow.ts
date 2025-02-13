// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Attachment } from '@microsoft/agents-activity-schema'
import { UserTokenClient } from './userTokenClient'
import { CloudAdapter } from '../cloudAdapter'
import { CardFactory } from '../cards/cardFactory'
import { BotStatePropertyAccessor } from '../state/botStatePropertyAccesor'
import { UserState } from '../state/userState'
import { TurnContext } from '../turnContext'
import { MessageFactory } from '../messageFactory'
import { debug } from '../logger'

const logger = debug('agents:web-chat-oauth-flow')

class FlowState {
  public flowStarted: boolean = false
  public userToken: string = ''
  public tokenExpiration: number = 0
}

export class WebChatOAuthFlow {
  userTokenClient?: UserTokenClient
  state: FlowState | null
  flowStateAccessor: BotStatePropertyAccessor<FlowState | null>

  constructor (userState: UserState) {
    this.state = null
    this.flowStateAccessor = userState.createProperty('flowState')
  }

  public async getOAuthToken (context: TurnContext) : Promise<string> {
    this.state = await this.getUserState(context)

    const now = Math.floor(Date.now() / 1000)
    const refreshThreshold = 300

    if (!this.state!.userToken || this.state!.tokenExpiration <= now + refreshThreshold) {
      logger.info('Refreshing token...')
      const newToken = await this.refreshToken(context)

      if (!newToken) {
        logger.error('Token refresh failed')
        return ''
      }
    }

    let retVal: string = ''
    const authConfig = context.adapter.authConfig
    const adapter = context.adapter as CloudAdapter
    const scope = 'https://api.botframework.com'
    const accessToken = await adapter.authProvider.getAccessToken(authConfig, scope)
    this.userTokenClient = new UserTokenClient(accessToken)

    if (this.state!.flowStarted === true) {
      const userToken = await this.userTokenClient.getUserToken(authConfig.connectionName!, context.activity.channelId!, context.activity.from?.id!)
      if (userToken !== null) {
        logger.info('Token obtained')
        this.state.userToken = userToken.token
        this.state.tokenExpiration = userToken.expiration ?? now + 3600000
        this.state.flowStarted = false
      } else {
        const code = context.activity.text as string
        const userToken = await this.userTokenClient!.getUserToken(authConfig.connectionName!, context.activity.channelId!, context.activity.from?.id!, code)
        if (userToken !== null) {
          logger.info('Token obtained with code')
          this.state.tokenExpiration = userToken.expiration ?? now + 3600000
          this.state.flowStarted = false
        } else {
          logger.error('Sign in failed')
          await context.sendActivity(MessageFactory.text('Sign in failed'))
        }
      }
      retVal = this.state.userToken
    } else if (this.state!.flowStarted === false) {
      logger.info('Starting oauth flow')
      const signingResource = await this.userTokenClient.getSignInResource(authConfig.clientId!, authConfig.connectionName!, context.activity)
      const oCard: Attachment = CardFactory.oauthCard(authConfig.connectionName!, 'Sign in', '', signingResource)
      await context.sendActivity(MessageFactory.attachment(oCard))
      this.state!.flowStarted = true
    }
    this.flowStateAccessor.set(context, this.state)
    return retVal
  }

  async signOut (context: TurnContext) {
    await this.userTokenClient!.signOut(context.activity.from?.id!, context.adapter.authConfig.connectionName!, context.activity.channelId!)
    this.state!.flowStarted = false
    this.state!.userToken = ''
    this.state!.tokenExpiration = 0
    this.flowStateAccessor.set(context, this.state)
    logger.info('User signed out successfully')
  }

  private async getUserState (context: TurnContext) {
    let userProfile: FlowState | null = await this.flowStateAccessor.get(context, null)
    if (userProfile === null) {
      userProfile = new FlowState()
    }
    return userProfile
  }

  private async refreshToken (context: TurnContext): Promise<string | null> {
    const authConfig = context.adapter.authConfig
    const adapter = context.adapter as CloudAdapter
    const scope = 'https://api.botframework.com'
    const accessToken = await adapter.authProvider.getAccessToken(authConfig, scope)
    this.userTokenClient = new UserTokenClient(accessToken)

    const userToken = await this.userTokenClient.getUserToken(
      authConfig.connectionName!,
      context.activity.channelId!,
      context.activity.from?.id!
    )

    if (userToken?.token) {
      logger.info('New token obtained')
      const now = Math.floor(Date.now() / 1000)
      const expiresIn = userToken.expiration ?? 3600000

      this.state!.userToken = userToken.token
      this.state!.tokenExpiration = now + expiresIn
      await this.flowStateAccessor.set(context, this.state)
      return userToken.token
    } else {
      logger.error('Failed to obtain a new token')
      return null
    }
  }
}
