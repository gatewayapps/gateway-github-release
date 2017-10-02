import { execSync } from 'child_process'

export default {
  getOwnerRepoFromRemote,
  getPreviousTagForCompare
}

export function getOwnerRepoFromRemote () {
  const info = {}
  try {
    const result = execSync('git remote get-url origin', { encoding: 'utf-8' })
    if (result) {
      const match = /https:\/\/github.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/.exec(result)
      if (match && match[1] && match[2]) {
        info.owner = match[1]
        info.repo = match[2]
      }
    }
    return info
  } catch (e) {
    console.error(e)
    return info
  }
}

export function getPreviousTagForCompare (currentTag) {
  try {
    const result = execSync('git tag --sort=-creatordate', { encoding: 'utf-8' })
    const tagsArray = result.split('\n')

    if (!tagsArray || tagsArray.length === 0) {
      return undefined
    }

    const currIndex = tagsArray.indexOf(currentTag)
    if (currIndex >= 0 && tagsArray.length > currIndex + 1) {
      return tagsArray[currIndex + 1]
    } else {
      return tagsArray[0]
    }
  } catch (e) {
    console.error(e)
    return undefined
  }
}
