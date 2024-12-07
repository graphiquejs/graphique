import { promises as fs } from 'fs'
import path from 'path'
import { Convert } from '#/input/geom-bar/api'
import { deleteUndefined } from 'utils/deleteUndefined'

const PKG = 'geom-bar'

export const fetchDocs = async () => {
  const filePath = path.join(process.cwd(), `./input/${PKG}/api.json`)
  const docs = Convert.toAPI(await fs.readFile(filePath, 'utf-8'))

  deleteUndefined(docs)

  return docs
}
