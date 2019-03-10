const Convert = require("ansi-to-html")
const { spawn } = require("child_process")

const convert = new Convert({
  fg: "#eee",
  bg: "#222",
  newline: false,
  escapeXML: true,
  stream: true
})

module.exports = (req, res) => {
  if (!req.body.module) {
    throw new Error(`Missing module not defined`)
  }

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Transfer-Encoding": "chunked",
    "X-Content-Type-Options": "nosniff"
  })

  res.write(`
    <head>
      <link href="https://fonts.googleapis.com/css?family=Quicksand:300,500" rel="stylesheet">
      <link href="/_polydev/styles.css" rel="stylesheet">
    </head>

    <body>
      <div id="splash"></div>

      <section>
        <main>
          <h1>
            Installing <kbd>${req.body.module}</kbd>&hellip;
          </h1>

          <pre><code>`)

  const args = ["add", req.body.module]

  if (req.body.dev) {
    args.push("--dev")
  }

  const child = spawn("yarn", args)

  res.write(`$ yarn ${args.join(" ")}\n`)

  child.stderr.on("data", (data) => res.write(convert.toHtml(`${data}`)))
  child.stdout.on("data", (data) => res.write(convert.toHtml(`${data}`)))

  child.on("close", (code, signal) => {
    if (!code) {
      res.write(`
        <script>window.location.href = ${JSON.stringify(req.body.path)}</script>
      `)
    }

    res.end()
  })
}
