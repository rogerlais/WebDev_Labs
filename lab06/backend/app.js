const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const ifpbapi = require("./scripts/ifpbapi");
//var api = new ifpbapi();

const indexRouter = require("./routes/index");
const { APIResult, DWAPI } = require("./scripts/ifpbapi");
const http = require("http");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "build")));

app.use("/api", indexRouter);

//!entrega 6 - item 1
app.get( "/file", async (req, res) =>{
	console.log( req.url );
    const api = new DWAPI( req.path, req.query );
    const ret = api.getFileContent();	
	res.status = 200;
	res.json( ret );
});

app.get( "/file/*", async (req, res) =>{
	console.log( req.url );
    const api = new DWAPI( req.path, req.query );
    const ret = api.getFileContent();
    res.json(ret);      
});


app.get("/", (req, res) => {
  res.sendFile("build/index.html", { root: __dirname });
});

app.get("/scripts/*", (req, res) => {
    console.log( 'js carregado');
    const jsFile = path.join( "build", req.url );
    res.sendFile(jsFile, { root: __dirname });
  });
  
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// TODO Web Template Studio: Add your own error handler here.
if (process.env.NODE_ENV === "production") {
  // Do not send stack trace of error message when in production
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send("Error occurred while handling the request.");
  });
} else {
  // Log stack trace of error message while in development
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    console.log(err);
    res.send(err.message);
  });
}

module.exports = app;
