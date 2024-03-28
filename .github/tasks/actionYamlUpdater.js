// eslint-disable-next-line import/no-extraneous-dependencies
const yaml = require('yaml')

const versionRegex = /\d+\.\d+\.\d+/

module.exports.readVersion = (contents) =>
  yaml.parse(contents).runs.image.match(versionRegex)[0]

module.exports.writeVersion = (contents, version) => {
  const actionFile = yaml.parse(contents)
  actionFile.runs.image = actionFile.runs.image.replace(versionRegex, version)

  return yaml.stringify(actionFile, {
    lineWidth: 100,
  })
}
