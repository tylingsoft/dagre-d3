/* eslint-env phantomjs */

// A *very* simple test runner to ensure that the demos work as expected.
const webpage = require('webpage')
const system = require('system')
const stdout = system.stdout
const stderr = system.stderr
    // Too bad this replaces the more function fs module from nodejs...
const fs = require('fs')
const start = new Date()

const red = '\x1b[31m'
const green = '\x1b[32m'
const grey = '\x1b[30;1m'
const reset = '\x1b[0m'

function htmlFile (file) { return file.match(/.*\.html/) }

const remaining = {}
ls('./dist/demo', htmlFile).forEach(function (f) { remaining[f] = true })
const testCount = Object.keys(remaining).length
const failures = []

stdout.write('\n')
stdout.write(grey + '  ')

Object.keys(remaining).forEach(function (url) {
  stdout.write('.')
  const page = webpage.create()
  page.onError = function (msg, trace) {
    failures.push({ url: url, msg: msg, trace: trace })
    testDone(url)
  }
  page.onLoadFinished = function (status) {
    if (status !== 'success') {
      failures.push({ url: url, msg: 'Could not load page' })
    }
    testDone(url)
  }
  page.open(url, function () {})
})

function ls (dir, filter) {
  const set = []
  fs.list(dir).forEach(function (file) {
    if (filter(file)) {
      set.push(dir + '/' + file)
    }
  })
  return set
}

function testDone (url) {
  delete remaining[url]
  console.log('Remaining: ' + Object.keys(remaining).length)
  if (!Object.keys(remaining).length) {
    stdout.write(reset + '\n')
    stdout.write('\n')
    failures.forEach(function (failure) {
      stderr.write(red + 'FAILED: ' + failure.url + reset + '\n')
      stderr.write(grey)
      stderr.write('  ' + failure.msg + '\n')
      if (failure.trace) {
        failure.trace.forEach(function (t) {
          stderr.write('    ' + t.file + ': ' + t.line + (t.function ? " (in function '" + t.function + "')" : '') + '\n')
        })
      }
      stderr.write(reset)
      stderr.write('\n')
    })
    stdout.write('  ' + green + (testCount - failures.length) + ' passing' + reset)
    if (failures.length) {
      stdout.write(' ' + red + (failures.length) + ' failing' + reset)
    }
    stdout.write(grey + ' (' + (new Date() - start) + 'ms)' + reset + '\n\n')
    phantom.exit(failures.length)
  }
}
