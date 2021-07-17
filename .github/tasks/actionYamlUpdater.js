// eslint-disable-next-line import/no-extraneous-dependencies
const yaml = require('yaml')

yaml.scalarOptions.str.fold.lineWidth = 100

const versionRegex = /\d+\.\d+\.\d+/

module.exports.readVersion = (contents) =>
  yaml.parse(contents).runs.image.match(versionRegex)[0]

module.exports.writeVersion = (contents, version) => {
  const actionFile = yaml.parse(contents)
  actionFile.runs.image = actionFile.runs.image.replace(versionRegex, version)

  return yaml.stringify(actionFile)
}
