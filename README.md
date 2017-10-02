# Gateway Github Release Creator
Build tool for creating a release in GitHub with release notes

## Getting Started
`npm install -g gateway-github-release`

## Creating release notes
`gateway-github-release create <tag> <token> [options]`

### Options
| Name      | Alias | Description |
| --------- | ----- | ----------- |
| projectId | -p    | Project identifier from releases.gatewayapps.com |
| scope     | -s    | Level of release notes to include: all, major, minor, patch |
| locale    | -l    | Locale of the release notes to use when generating the notes for the Github release |
| owner     | -o    | Owner of the Github repo. If not provided, will attempt to parse the owner from the git remote origin. |
| repo      | -r    | Repo name in Github. If not provided, will attempt to parse the repo from the git remote origin. |
| commit    | -c    | Specifies the commitish value to be used for tag. Not used if the tag already exists. The default if not provide is the default branch of repository. |
| name      | -n    | Name for the release. If not provided, the tag name will be used. |
| version   | -v    | Version number to use when getting release notes. If not provided, the tag name with only digits and "." will be used. |

Options may also be provided in a `gatewayGithubRelease.json` file located in the root working directory from where the command line tool executed. Any options passed through the CLI will take precedence over options from this file.
