import process from 'node:process'
import dotenv from 'dotenv'
import humps from 'humps'
import fetch from 'node-fetch'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const { decamelizeKeys, camelizeKeys } = humps

function auth() {
  const AUTH_URL = 'https://www.strava.com/oauth/token'
  const CLIENT_ID = process.env.STRAVA_CLIENT_ID
  const SECRET = process.env.STRAVA_SECRET
  const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN
  console.log({
    clientId: CLIENT_ID,
    clientSecret: SECRET,
    refreshToken: REFRESH_TOKEN,
    grantType: 'refresh_token',
  })
  return fetch(AUTH_URL, {
    method: 'POST',
    body: JSON.stringify(decamelizeKeys({
      clientId: CLIENT_ID,
      clientSecret: SECRET,
      refreshToken: REFRESH_TOKEN,
      grantType: 'refresh_token',
    })),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then(
      response =>
        response.json() as Promise<{
          token_type: string
          access_token: string
          expires_at: number
          expires_in: number
          refresh_token: string
        }>,
    )
    .then(data => camelizeKeys<typeof data>(data))
}

// const authInfo = await auth()
// const accessToken = authInfo.accessToken
const accessToken = process.env.TEST_ACCESS_TOKEN
console.log(accessToken)

const BASE_URL = 'https://www.strava.com/api/v3'

// fetch(
//   `${BASE_URL}/athlete/activities?${new URLSearchParams(
//     decamelizeKeys({
//       accessToken,
//     }) as Record<string, string>,
//   )}`,
//   {
//     method: 'GET',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${accessToken}`,
//     },
//   },
// )
//   .then(res => res.json())
//   .then(console.log)
