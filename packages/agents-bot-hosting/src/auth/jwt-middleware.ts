/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AuthConfiguration } from './authConfiguration'
import { Response, NextFunction } from 'express'
import { Request } from './request'
import jwksRsa, { JwksClient, SigningKey } from 'jwks-rsa'
import jwt, { JwtHeader, JwtPayload, SignCallback, GetPublicKeyOrSecret } from 'jsonwebtoken'
import { debug } from '../logger'

const logger = debug('agents:jwt-middleware')

const verifyToken = async (raw: string, config: AuthConfiguration): Promise<JwtPayload> => {
  const getKey: GetPublicKeyOrSecret = (header: JwtHeader, callback: SignCallback) => {
    const payload = jwt.decode(raw) as JwtPayload

    const jwksUri: string = payload.iss === 'https://api.botframework.com'
      ? 'https://login.botframework.com/v1/.well-known/keys'
      : `https://login.microsoftonline.com/${config.tenantId}/discovery/v2.0/keys`

    const jwksClient: JwksClient = jwksRsa({ jwksUri })

    jwksClient.getSigningKey(header.kid, (err: Error | null, key: SigningKey | undefined): void => {
      if (err != null) {
        logger.error(JSON.stringify(err))
        callback(err, undefined)
        return
      }
      const signingKey = key?.getPublicKey()
      callback(null, signingKey)
    })
  }

  return await new Promise((resolve, reject) => {
    const verifyOptions: jwt.VerifyOptions = {
      issuer: config.issuers,
      audience: config.clientId,
      ignoreExpiration: false,
      algorithms: ['RS256']
    }

    jwt.verify(raw, getKey, verifyOptions, (err, user) => {
      if (err != null) {
        logger.error(JSON.stringify(err))
        reject(err)
        return
      }
      const tokenClaims = user as JwtPayload
      if (tokenClaims.aud !== config.clientId) {
        logger.error(`token audience ${tokenClaims.aud} does not match client id ${config.clientId}`)
        reject(new Error('token audience does not match client id'))
      }
      logger.info(`token verified for ${tokenClaims.aud}`)
      resolve(tokenClaims)
    })
  })
}

export const authorizeJWT = (authConfig: AuthConfiguration) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization as string
    if (authHeader) {
      const token: string = authHeader.split(' ')[1] // Extract the token from the Bearer string
      try {
        const user = await verifyToken(token, authConfig)
        req.user = user
        next()
      } catch (err: Error | any) {
        res.status(401).send({ 'jwt-auth-error': err.message })
      }
    } else {
      if (!authConfig.clientId && process.env.NODE_ENV !== 'production') {
        logger.info('using anonymous auth')
        req.user = { name: 'anonymous' }
        next()
      } else {
        res.status(401).send({ 'jwt-auth-error': 'authorization header not found' })
      }
    }
  }
}
