// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActionTypes, Activity, ActivityTypes, Attachment } from '@microsoft/agents-bot-activity'
import { cards, TurnContext } from '@microsoft/agents-bot-hosting'

const CardFactory = cards.CardFactory

export class CardMessages {
  static async sendIntroCard (context: TurnContext): Promise<void> {
    // Note that some channels require different values to be used in order to get buttons to display text.
    // In this code the emulator is accounted for with the 'title' parameter, but in other channels you may
    // need to provide a value for other parameters like 'text' or 'displayText'.
    const buttons = [
      { type: ActionTypes.ImBack, title: '1. Adaptive Card', value: '1' },
      { type: ActionTypes.ImBack, title: '2. Animation Card', value: '2' },
      { type: ActionTypes.ImBack, title: '3. Audio Card', value: '3' },
      { type: ActionTypes.ImBack, title: '4. Hero Card', value: '4' },
      { type: ActionTypes.ImBack, title: '5. Receipt Card', value: '5' },
      // { type: ActionTypes.ImBack, title: '6. oAuth Card [NotImplemented]', value: '6' }, // TODO still pending
      { type: ActionTypes.ImBack, title: '7. o365Connector Card', value: '7' },
      // { type: ActionTypes.ImBack, title: '8. Signin Card [NotImplemented]', value: '8' }, // TODO still pending
      { type: ActionTypes.ImBack, title: '9. Thumbnail Card', value: '9' },
      { type: ActionTypes.ImBack, title: '10. Video Card', value: '10' },
    ]

    const card = CardFactory.heroCard('', undefined,
      buttons, { text: 'Select one of the following choices' })

    await CardMessages.sendActivity(context, card)
  }

  static async sendAdaptiveCard (context: TurnContext, adaptiveCard: any): Promise<void> {
    const card = CardFactory.adaptiveCard(adaptiveCard)

    await CardMessages.sendActivity(context, card)
  }

  static async sendAnimationCard (context: TurnContext): Promise<void> {
    const card = CardFactory.animationCard(
      'Agents SDK',
      [
        { url: 'https://i.giphy.com/Ki55RUbOV5njy.gif' }
      ],
      [],
      {
        subtitle: 'Animation Card'
      }
    )

    await CardMessages.sendActivity(context, card)
  }

  static async sendAudioCard (context: TurnContext): Promise<void> {
    const card = CardFactory.audioCard(
      'I am your father',
      ['https://www.mediacollege.com/downloads/sound-effects/star-wars/darthvader/darthvader_yourfather.wav'],
      CardFactory.actions([
        {
          type: 'openUrl',
          title: 'Read more',
          value: 'https://en.wikipedia.org/wiki/The_Empire_Strikes_Back'
        }
      ]),
      {
        subtitle: 'Star Wars: Episode V - The Empire Strikes Back',
        text: 'The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back) is a 1980 American epic space opera film directed by Irvin Kershner. Leigh Brackett and Lawrence Kasdan wrote the screenplay, with George Lucas writing the film\'s story and serving as executive producer. The second installment in the original Star Wars trilogy, it was produced by Gary Kurtz for Lucasfilm Ltd. and stars Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Kenny Baker, Peter Mayhew and Frank Oz.',
        image: { url: 'https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg' }
      }
    )

    await CardMessages.sendActivity(context, card)
  }

  static async sendHeroCard (context: TurnContext): Promise<void> {
    const card = CardFactory.heroCard(
      'Copilot Hero Card',
      CardFactory.images(['https://blogs.microsoft.com/wp-content/uploads/prod/2023/09/Press-Image_FINAL_16x9-4.jpg']),
      CardFactory.actions([
        {
          type: 'openUrl',
          title: 'Get started',
          value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
        }
      ])
    )

    await CardMessages.sendActivity(context, card)
  }

  static async sendReceiptCard (context: TurnContext): Promise<void> {
    const card = CardFactory.receiptCard({
      title: 'John Doe',
      facts: [
        {
          key: 'Order Number',
          value: '1234'
        },
        {
          key: 'Payment Method',
          value: 'VISA 5555-****'
        }
      ],
      items: [
        {
          title: 'Data Transfer',
          price: '$38.45',
          quantity: 368,
          image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png' }
        },
        {
          title: 'App Service',
          price: '$45.00',
          quantity: 720,
          image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png' }
        }
      ],
      tax: '$7.50',
      total: '$90.95',
      buttons: CardFactory.actions([
        {
          type: 'openUrl',
          title: 'More information',
          value: 'https://azure.microsoft.com/en-us/pricing/details/bot-service/'
        }
      ])
    })

    await CardMessages.sendActivity(context, card)
  }

  static async sendOauthCard (context: TurnContext): Promise<void> {
    // TODO still pending
    throw new Error('NotImplemented')
  }

  // static async sendO365ConnectorCard (context: TurnContext): Promise<void> {
  //   const card = CardFactory.o365ConnectorCard({
  //     title: 'card title',
  //     text: 'card text',
  //     summary: 'O365 card summary',
  //     themeColor: '#E67A9E',
  //     sections: [
  //       {
  //         text: 'This is some <strong>bold</strong> text'
  //       },
  //       {
  //         text: 'This is some <em>italic</em> text'
  //       },
  //       {
  //         text: 'This is some <strike>strikethrough</strike> text'
  //       },
  //       {
  //         text: '<h1>Header 1</h1>\r<h2>Header 2</h2>\r <h3>Header 3</h3>'
  //       },
  //       {
  //         text: 'bullet list <ul><li>text</li><li>text</li></ul>'
  //       },
  //       {
  //         text: 'ordered list <ol><li>text</li><li>text</li></ol>'
  //       },
  //       {
  //         text: 'hyperlink <a href="https://www.bing.com/">Bing</a>'
  //       },
  //       {
  //         text: 'embedded image <img src="https://aka.ms/Fo983c" alt="Duck on a rock"></img>'
  //       },
  //       {
  //         text: 'preformatted text <pre>text</pre>'
  //       },
  //       {
  //         text: 'Paragraphs <p>Line a</p><p>Line b</p>'
  //       },
  //       {
  //         text: '<blockquote>Blockquote text</blockquote>'
  //       }
  //     ]
  //   })

  //   await CardMessages.sendActivity(context, card)
  // }

  static async sendSigninCard (context: TurnContext) {
    // TODO still pending
    throw new Error('NotImplemented')
  }

  static async sendThumbnailCard (context: TurnContext) {
    const card = CardFactory.thumbnailCard(
      'Copilot Thumbnail Card',
      [{ url: 'https://blogs.microsoft.com/wp-content/uploads/prod/2023/09/Press-Image_FINAL_16x9-4.jpg' }],
      [{
        type: 'openUrl',
        title: 'Get started',
        value: 'https://docs.microsoft.com/en-us/azure/bot-service/'
      }],
      {
        subtitle: 'Your bots — wherever your users are talking.',
        text: 'Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.'
      }
    )

    await CardMessages.sendActivity(context, card)
  }

  static async sendVideoCard (context: TurnContext) {
    const card = CardFactory.videoCard(
      '2018 Imagine Cup World Championship Intro',
      [{ url: 'https://sec.ch9.ms/ch9/783d/d57287a5-185f-4df9-aa08-fcab699a783d/IC18WorldChampionshipIntro2.mp4' }],
      [{
        type: 'openUrl',
        title: 'Lean More',
        value: 'https://channel9.msdn.com/Events/Imagine-Cup/World-Finals-2018/2018-Imagine-Cup-World-Championship-Intro'
      }],
      {
        subtitle: 'by Microsoft',
        text: 'Microsoft\'s Imagine Cup has empowered student developers around the world to create and innovate on the world stage for the past 16 years. These innovations will shape how we live, work and play.'
      }
    )

    await CardMessages.sendActivity(context, card)
  }

  private static async sendActivity (context: TurnContext, card: Attachment): Promise<void> {
    await context.sendActivity(Activity.fromObject(
      {
        type: ActivityTypes.Message,
        attachments: [card]
      }
    )
    )
  }
}
