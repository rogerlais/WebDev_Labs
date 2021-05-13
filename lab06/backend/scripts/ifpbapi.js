const path = require("path");

class FSUtils {
	static #fs = require("fs");
	static #path = require("path");

	static getFS() {
		return this.#fs;
	}

	static getPath() {
		return this.#path;
	}

	static isReadble(path) {
		try {
			let stf = this.#fs.lstatSync(path);
			if (stf ?? false) {
				return (
					stf.isFile() && //HACK Podemos ter tipos de entradas diversas agora file & dir(sockect/link/etc)
					FSUtils.testFileAccess(path, this.#fs.constants.R_OK)
				);
			} else {
				return false;
			}				
		} catch (error) {
			return false;
		}
	}

	static isListble(path) {
		let stf = this.#fs.lstatSync(path);
		if (stf ?? false) {
			return (
				stf.isDirectory() && //HACK Podemos ter tipos de entradas diversas agora file & dir(sockect/link/etc)
				FSUtils.testFileAccess(path, this.#fs.constants.R_OK)
			);
		} else {
			return false;
		}
	}

	static isWriteble(path) {
		return FSUtils.testFileAccess(
			path,
			this.#fs.constants.R_OK | this.#fs.constants.W_OK
		);
	}

	static testFileAccess(path, access) {
		const fileAccess = (filename, mode) => {
			try {
				this.#fs.accessSync(filename, mode);
				return true;
			} catch (err) {
				return false;
			}
		};
		return fileAccess(path, access);
	}

	static Exists(path) {
		return this.#fs.statSync(path) != null ?? false; //consegue identificar ser uma entrada
	}

	static isFile(path) {
		try {
			return this.#fs.statSync(path).isFile;
		} catch (error) {
			return false;
		}
	}

	static getFileContent(filename) {
		var ret = this.#fs.readFileSync(filename);
		return ret.toLocaleString();
	}

	static isDirectory(path) {
		try {
			let st = this.#fs.lstatSync(path);
			if (st ?? false) {
				return st.isDirectory();
			} else {
				return false;
			}
		} catch (error) {
			return false;
		}
	}

	static normalizePath(path) {
		return this.#path.normalize(path.replace('/^"(.*)"$/', "$1")); //elimina aspas nos extremos - alternativa a splice(1,-1) por segurança
	}

	static relative2Absolute(path) {
		return this.#path.resolve(process.cwd(), p);
	}
}

class APIResult {
	constructor(action, input, output) {
		this.action = action;
		this.input = input;
		this.output = output;
	}
}

class DWAPI {
	constructor(action, input) {
		this.action = action;
		this.input = input;
		this.result = null;
	}

	getFileContent() {
		if (null != this.input) {
			const target = FSUtils.normalizePath(this.input.input);
			if (FSUtils.isDirectory(target)) {
				if (FSUtils.isListble(target)) {
					const fs = FSUtils.getFS();
					const path = FSUtils.getPath();
					var ret = "";
					fs.readdirSync(target).forEach((file) => {
						//todo aprender a criar callbacks e remover agregação de FS
						var statFile = fs.statSync(path.join(target, file));
						if (statFile.isFile()) {
							ret += `FILE: ${path
								.join(target, file)
								.padEnd(80, ".")} tamanho: ${statFile.size}\n`;
						} else {
							ret += `DIR : ${path.join(target, file)}\n`;
						}
					});
					return ret;
				} else {
					return `Diretório ${target} não pode ser lido.`;
				}
			} else {
				if (FSUtils.isReadble(target)) {
					return FSUtils.getFileContent(target);
				} else {
					return `Arquivo: ${target} não pode ser lido!!!`;
				}
			}
		}
	}

	getResult() {
		switch (this.action) {
			case "/minimum": {
				this.result = this.minValue();
				break;
			}
			case "/maximum": {
				this.result = this.maxValue();
				break;
			}
			case "/lowercase": {
				this.result = this.lowercase();
				break;
			}
			case "/uppercase": {
				this.result = this.uppercase();
				break;
			}
			default: {
				this.result = new APIResult(
					this.action,
					this.input,
					"Valores inconsistentes ou action desconhecida."
				);
			}
		}
		return this.result;
	}

	lowercase() {
		var ret;
		if (this.input.input) {
			//HACK input -> campo do get recebido
			ret = this.input.input.toString().toLocaleLowerCase();
		} else {
			ret = "Conteudo de input nulo";
		}
		return new APIResult(this.action, this.input.input, ret);
	}

	uppercase() {
		var ret;
		if (this.input.input) {
			//HACK input -> campo do get recebido
			ret = this.input.input.toString().toLocaleUpperCase();
		} else {
			ret = "Conteudo de input nulo";
		}
		return new APIResult(this.action, this.input.input, ret);
	}

	minValue() {
		if (this.input.input) {
			//HACK input -> campo do get recebido
			var values = this.input.input.split(",");
			if (values[0]) {
				var ret = values[0];
				values.forEach((element) => {
					if (ret > element) {
						ret = element;
					}
				});
			} else {
				ret = "Dados de (input) invalidos";
			}
		} else {
			ret = "Conteudo de input nulo";
		}
		return new APIResult(this.action, this.input.input, ret);
	}

	maxValue() {
		if (this.input.input) {
			//HACK input -> campo do get recebido
			var values = this.input.input.split(",");
			if (values[0]) {
				var ret = values[0];
				values.forEach((element) => {
					if (ret < element) {
						ret = element;
					}
				});
			} else {
				ret = "Dados de (input) invalidos";
			}
		} else {
			ret = "Conteudo de input nulo";
		}
		return new APIResult(this.action, this.input.input, ret);
	}
}

module.exports = {
	APIResult: APIResult,
	DWAPI: DWAPI,
};
