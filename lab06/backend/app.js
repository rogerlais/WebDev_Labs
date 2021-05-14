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
app.use(express.json()); //HACK essencial para maniupular dados no body do http
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname, "build")));

app.use("/api", indexRouter);

//!entrega 6 - item 1
app.get("/file", async (req, res) => {
	console.log(req.url);
	const api = new DWAPI(req.path, req.query);
	const ret = api.getFileContent();
	res.status = 200;
	res.json(ret);
});


app.get("/exec", async (req, res) => {
	console.log(req.url);
	const api = new DWAPI(req.path, req.query);
	const ret = api.execCommand();
	res.status = 200;
	res.json(ret);
});


app.put("/setfile", async (req, res) => {
	let body = [];
	req.on("data", (chunk) => {
		//todo captura dos pacotes de dados
		body.push(chunk);
	})
		.on("end", () => {
			//todo finalizar leitura dos dados
			body = Buffer.concat(body).toString();
			// At this point, we have the headers, method, url and body, and can now
			// do whatever we need to in order to respond to this request.
		})
		.on("error", (error) => {
			//todo tratamento do erro
			console.error(err);
		});
	if( body.length == 0 ){
		body = req.body;
	}
	const api = new DWAPI(req.path, req.query);
	const ret = api.setFileContent( body['content'] );
	res.status = 200;
	res.json(ret);
});

app.get("/*", (req, res) => {
	console.log(req.url);
	if (req.url.endsWith("/") || req.url.endsWith("index.html")) {
		res.sendFile("build/index.html", { root: __dirname });
	} else {
		if (req.url.endsWith("favicon.ico")) {
			res.sendFile("build/favicon.ico", { root: __dirname });
		}
	}
});

app.get("/scripts/*", (req, res) => {
	console.log("js carregado");
	const jsFile = path.join("build", req.url);
	res.sendFile(jsFile, { root: __dirname });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

app.use((req, res, next) =>{
	console.log( `Recurso: ${req.url}`);
	next( req, res );
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
