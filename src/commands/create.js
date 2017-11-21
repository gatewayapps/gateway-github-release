import path from 'path'
import GitHubApi from 'github'
import rnsDownload from 'rns-download'
import { readJson } from '../helpers/file'
import githubHelper from '../helpers/github'

export const command = 'create <tag> <token>'

export const desc = 'Creates a release on GitHub'

export const builder = {
  tag: {
    alias: 't',
    type: 'string',
    describe: 'Git tag name to be used when creating the release',
    demandOption: true
  },
  token: {
    alias: 'k',
    type: 'string',
    describe: 'Github Api token with access to create a release on the repo',
    demandOption: true
  },
  projectId: {
    alias: 'p',
    type: 'string',
    describe: 'Project identifier from release.gatewayapps.com'
  },
  scope: {
    alias: 's',
    type: 'string',
    default: undefined,
    choices: ['all', 'major', 'minor', 'patch']
  },
  locale: {
    alias: 'l',
    type: 'string',
    default: 'en-US',
    describe: 'Locale of the release notes to use when generating the notes for the Github release'
  },
  owner: {
    alias: 'o',
    type: 'string',
    describe: 'Owner of the Github repo. If not provided, will attempt to parse the owner from the git remote origin.'
  },
  repo: {
    alias: 'r',
    type: 'string',
    describe: 'Repo name in Github. If not provided, will attempt to parse the repo from the git remote origin.'
  },
  commit: {
    alias: 'c',
    type: 'string',
    describe: 'Specifies the commitish value to be used for tag. Not used if the tag already exists. The default if not provide is the default branch of repository.'
  },
  version: {
    alias: 'v',
    type: 'string',
    describe: 'Version number to use when getting release notes. If not provided, the tag name with only digits and "." will be used.'
  }
}

export function handler (argv) {
  const opts = parseOptions(argv)

  const downloadOpts = {
    scope: opts.scope,
    format: 'json',
    locale: opts.locale
  }

  return rnsDownload.getReleaseNotes(opts.projectId, opts.version, downloadOpts)
    .then((releaseNotes) => {
      let releaseNotesMd = rnsDownload.toMarkdown(releaseNotes, opts.locale)
      const previousTag = githubHelper.getPreviousTagForCompare(opts.tag)
      if (previousTag) {
        releaseNotesMd += `\nhttps://github.com/${opts.owner}/${opts.repo}/compare/${previousTag}...${opts.tag}\n`
      }

      const github = new GitHubApi({
        protocol: 'https',
        host: 'api.github.com',
        pathPrefix: '',
        timeout: 5000,
        headers: {
          'user-agent': 'gateway-release-notes'
        }
      })

      github.authenticate({
        type: 'token',
        token: opts.token
      })

      let releaseTitle

      if (releaseNotes.length > 0) {
        const rn = releaseNotes[0]
        releaseTitle = rn.version
        if (rn.name) {
          releaseTitle += `: ${rn.name}`
        }
      } else {
        releaseTitle = opts.tag
      }

      return github.repos.createRelease({
        owner: opts.owner,
        repo: opts.repo,
        tag_name: opts.tag,
        target_commitish: opts.commit,
        name: releaseTitle,
        body: releaseNotesMd,
        draft: false,
        prerelease: false
      })
    })
}

function parseOptions (argv) {
  const optPath = path.resolve('./gatewayGithubRelease.json')
  let opts = readJson(optPath) || {}

  Object.keys(argv).forEach((key) => {
    if (argv[key]) {
      opts[key] = argv[key]
    }
  })

  if (!opts.tag) {
    throw new Error('Tag name is required')
  }

  if (!opts.token) {
    throw new Error('Github api token is required')
  }

  if (!opts.projectId) {
    throw new Error('Release notes project ID is required')
  }

  if (!opts.owner || !opts.repo) {
    let info = githubHelper.getOwnerRepoFromRemote()
    opts.owner = info.owner
    opts.repo = info.repo

    if (!opts.owner || !opts.repo) {
      throw new Error('Github Owner and Repo name are required.')
    }
  }

  if (!opts.scope) {
    opts.scope = 'patch'
  }

  if (!opts.locale) {
    opts.locale = 'en-US'
  }

  if (!opts.version) {
    opts.version = opts.tag.replace(/[^0-9.]/g, '')
  }

  return opts
}
