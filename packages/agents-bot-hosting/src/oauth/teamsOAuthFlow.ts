// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Activity, ActivityTypes, Attachment } from '@microsoft/agents-bot-activity'
import { SigningResource } from './signingResource'
import { TokenExchangeRequest } from './tokenExchangeRequest'
import { UserTokenClient } from './userTokenClient'
import { CloudAdapter } from '../cloudAdapter'
import { CardFactory } from '../cardFactory'
import { BotStatePropertyAccessor } from '../state/botStatePropertyAccesor'
import { UserState } from '../state/userState'
import { TurnContext } from '../turnContext'
import { MessageFactory } from '../messageFactory'
import { debug } from '../logger'

const logger = debug('agents:teams-oauth-flow')

class FlowState {
  public flowStarted: boolean = false
  public userToken: string = ''
  public flowExpires: number = 0
}

export class TeamsOAuthFlow {
  userTokenClient?: UserTokenClient
  state: FlowState | null
  flowStateAccessor: BotStatePropertyAccessor<FlowState | null>
  tokenExchangeId: string | null = null
  constructor (userState: UserState) {
    this.state = null
    this.flowStateAccessor = userState.createProperty('flowState')
  }

  public async beginFlow (context: TurnContext): Promise<string> {
    this.state = await this.getUserState(context)

    if (this.state.userToken !== '') {
      return this.state.userToken
    }

    const adapter = context.adapter as CloudAdapter
    const authConfig = context.adapter.authConfig
    const scope = 'https://api.botframework.com'
    const accessToken = await adapter.authProvider.getAccessToken(authConfig, scope)
    this.userTokenClient = new UserTokenClient(accessToken)
    const retVal: string = ''
    await context.sendActivities([MessageFactory.text('authorizing user'), new Activity(ActivityTypes.Typing)])
    const signingResource: SigningResource = await this.userTokenClient.getSignInResource(authConfig.clientId!, authConfig.connectionName!, context.activity)
    const oCard: Attachment = CardFactory.oauthCard(authConfig.connectionName as string, 'Sign in', '', signingResource)
    await context.sendActivity(MessageFactory.attachment(oCard))
    this.state.flowStarted = true
    this.state.flowExpires = Date.now() + 30000
    await this.flowStateAccessor.set(context, this.state)
    logger.info('OAuth flow started')
    return retVal
  }

  public async continueFlow (context: TurnContext): Promise<string> {
    if (this.state?.flowExpires !== 0 && Date.now() > this.state!.flowExpires) {
      logger.warn('Sign-in flow expired')
      this.state!.flowStarted = false
      this.state!.userToken = ''
      await context.sendActivity(MessageFactory.text('Sign-in session expired. Please try again.'))
      return ''
    }
    this.state = await this.getUserState(context)
    const contFlowActivity = context.activity
    const authConfig = context.adapter.authConfig
    const tokenExchangeRequest = contFlowActivity.value as TokenExchangeRequest
    if (this.tokenExchangeId === tokenExchangeRequest.id) {
      return '' // dedupe
    }
    this.tokenExchangeId = tokenExchangeRequest.id!
    const userTokenReq = await this.userTokenClient?.exchangeTokenAsync(contFlowActivity.from?.id!, authConfig.connectionName!, contFlowActivity.channelId!, tokenExchangeRequest)
    logger.info('Token obtained')
    this.state!.userToken = userTokenReq.token
    this.state!.flowStarted = false
    await context.sendActivity(MessageFactory.text('User signed in' + new Date().toISOString()))
    await this.flowStateAccessor.set(context, this.state)
    return this.state?.userToken!
  }

  public async signOut (context: TurnContext): Promise<void> {
    await this.userTokenClient?.signOut(context.activity.from?.id as string, context.adapter.authConfig.connectionName as string, context.activity.channelId as string)
    await context.sendActivity(MessageFactory.text('User signed out'))
    this.state!.userToken = ''
    this.state!.flowExpires = 0
    await this.flowStateAccessor.set(context, this.state)
    logger.info('User signed out successfully')
  }

  private async getUserState (context: TurnContext) {
    let userProfile: FlowState | null = await this.flowStateAccessor.get(context, null)
    if (userProfile === null) {
      userProfile = new FlowState()
    }
    return userProfile
  }
}
