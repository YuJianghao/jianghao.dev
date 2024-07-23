import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import polyline from '@mapbox/polyline'
import dotenv from 'dotenv'
import humps from 'humps'
import fetch from 'node-fetch'
import type { BaseActivity } from '~/types'

const dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })
dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const { decamelizeKeys, camelizeKeys } = humps

const BASE_URL = 'https://www.strava.com/api/v3'

const authInfo = await auth()
const accessToken = authInfo.accessToken
const activities = await getActivities()
await writeFile(activities, 'raw-activities.json')
const baseActivities = await getBaseActivities(activities)
await writeFile(baseActivities, 'strava-activities.json')

async function writeFile(data: any, filename: string) {
  return fs.writeFile(path.resolve(dirname, '..', filename), JSON.stringify(data, null, 2))
}

function auth() {
  const AUTH_URL = 'https://www.strava.com/oauth/token'
  const CLIENT_ID = process.env.STRAVA_CLIENT_ID
  const SECRET = process.env.STRAVA_SECRET
  const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN
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

function getActivities() {
  return fetch(
    `${BASE_URL}/athlete/activities?${new URLSearchParams(
      decamelizeKeys({
        accessToken,
        perPage: 200,
      }) as Record<string, string>,
    )}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    },
  )
    .then(res => res.json() as Promise<any[]>)
    .then(data => camelizeKeys<typeof data>(data)) as Promise<any[]>
}

function getBaseActivities(list: any[]) {
  return list.map<BaseActivity>(item => ({
    id: item.id,
    name: item.name,
    distance: item.distance,
    movingTime: item.movingTime,
    elapsedTime: item.elapsedTime,
    totalElevationGain: item.totalElevationGain,
    sportType: item.sportType,
    startDate: item.startDate,
    map: transformMap(item.map),
  }))
}

function transformMap(map: { summaryPolyline: string }) {
  if (!map.summaryPolyline)
    return null
  const summaryPolyline = map.summaryPolyline
  const decodedPolyline = polyline.decode(summaryPolyline) as [number, number][]

  const lats = decodedPolyline.map(point => point[0])
  const lngs = decodedPolyline.map(point => point[1])

  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const earthRadius = 6371000 // 地球半径，单位为 m
  const latRange = maxLat - minLat // 纬度范围
  const lngRange = maxLng - minLng // 经度范围

  const width = earthRadius * Math.cos((minLat + maxLat) / 2 / 180 * Math.PI) * lngRange / 180 * Math.PI
  const height = earthRadius * latRange / 180 * Math.PI
  const points = decodedPolyline.map<[number, number]>(([lat, lng]) => {
    return [(lng - minLng) / lngRange * width, (lat - minLat) / latRange * height]
  })
  return { width, height, points }
}
