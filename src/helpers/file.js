import fs from 'fs'

export function readJson (filePath) {
  let jsonObject
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
    if (content) {
      jsonObject = JSON.parse(content)
    }
  }
  return jsonObject
}
