const Koa = require("koa")
const Router = require("koa-router")
const BodyParser = require("koa-bodyparser")
const Handlebars = require("handlebars")
const Lowdb = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")
const fs = require("fs")

var adapter = new FileSync("database.json")
var db = Lowdb(adapter)
var app = new Koa()
var router = new Router()

db.defaults({ records: [] })
  .write()

router
  .get("/", async (ctx, next) => {
    var records = db.get("records").value()
    var template = Handlebars.compile(fs.readFileSync("templates/index.html",
    "utf8"))
    ctx.body = template({
      "records": records
    })
  })
  .get("/new", async (ctx, next) => {
    var template = fs.readFileSync("templates/new.html", "utf8")
    ctx.body = template
  })
  .post("/create", async (ctx, next) => {
    console.log(ctx.request.body)
    var record = {
      name: ctx.request.body.name,
      body: ctx.request.body.body
    }
    db.get("records")
      .push(record)
      .write()
    ctx.redirect("/")
  })
  .get("/edit/:name", async (ctx, next) => {
    var record = db.get("records")
      .find({ name: ctx.params.name })
      .value()
    var template = Handlebars.compile(fs.readFileSync("templates/edit.html",
    "utf8"))

    ctx.body = template({
      "rec": record
    })
  })
  .post("/update/:name", async (ctx, next) => {
    var newRecord = {
      name: ctx.request.body.name,
      body: ctx.request.body.body
    }
    db.get("records")
      .find({ name: ctx.params.name })
      .assign(newRecord)
      .write()
    ctx.redirect("/")
  })
  .get("/delete/:name", async (ctx, next) => {
    db.get("records")
      .remove({ name: ctx.params.name })
      .write()
    ctx.redirect("/")
  })

app.use(BodyParser())
app.use(router.routes())
app.use(router.allowedMethods())

console.log("starting server @ http://localhost:3000")
app.listen(3000)
