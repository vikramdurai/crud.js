const Koa = require("koa")
const Handlebars = require("handlebars")
const low = require("lowdb")
const fs = require("fs")
const bodyParser = require("koa-bodyparser")
const FileSync = require("lowdb/adapters/FileSync")

const app = new Koa()
const adapter = new FileSync("database.json")
const db = low(adapter)

db.defaults({ records: [] })
  .write()

app.use(bodyParser())


newFun = (fn) => {
  return (async ctx => {
    fn(ctx)
  })
}

indexHandler = ctx => {
  var tmpl = fs.readFileSync("templates/index.html", "utf8")
  var rec = db.get("posts")
    .filter()
    .value()
  var template = Handlebars.compile(tmpl)
  res = template({
    "records": rec
  })
  ctx.body = res
}

newHandler = ctx => {
  var tmpl = fs.readFileSync("templates/new.html", "utf8")
  ctx.body = tmpl
}

createHandler = ctx => {
  var name = ctx.request.body.name
  var body = ctx.request.body.body
  console.log(`Creating object with name ${name} and body ${body}`);
  db.get("records")
    .push({ name: name, body: body })
    .write()
  ctx.redirect("/")
}

const routes = [
  {route: "/", handler: newFun(indexHandler)},
  // {route: "/edit", handler: newFun(editHandler)},
  // {route: "/delete", handler: newFun(deleteHandler)},
  {route: "/new", handler: newFun(newHandler)},
  {route: "/create", handler: newFun(createHandler)}
]

app.use(async ctx => {
  for (var i = 0; i < routes.length; i++) {
    if (ctx.request.path == routes[i].route) {
      routes[i].handler(ctx)
      return
    }
  }
  ctx.body = "<h1>Not Found</h1>"
})

console.log("Starting server @ localhost:3000")
app.listen(3000)
