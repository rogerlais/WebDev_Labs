class Host {
	//constructor
	constructor(hostname, address, mask) {
		this.hostname = hostname;
		this.address = address;
		this.mask = mask;
	}
}

async function readFileContent(server, resource) {
	try {
		const ret = await fetch(`${server}/file?input=${resource}`).then(
			(response) => {
				let ret = response.json();
				return ret;
			}
		);
		return ret;
	} catch (error) {
		return `Erro ocorrido: ${error}`;
	}
}

async function execCommand(server, cmdLine) {
	try {
		const ret = await fetch(`${server}/exec?input=${cmdLine}`).then(
			(response) => {
				let ret = response.json();
				return ret;
			}
		);
		return ret;
	} catch (error) {
		return `Erro ocorrido: ${error}`;
	}
}

async function writeFileContent(server, resname, txtContent) {
	try {
		const data = { content: txtContent };
		return (res = await fetch(`${server}/setfile?input=${resname}`, {
			method: "PUT", // or 'PUT'
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (response.ok) {
					return "Arquivo salvo com sucesso";
				} else {
					return "Arquivo não pode ser salvo";
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				return `Erro ocorrido: ${error}`;
			}));
	} catch (error) {
		return `Erro ocorrido: ${error}`;
	}
}

function bindGetOperation(document) {
	const btnFileOper = document.getElementById("invokeGetFileContent");
	btnFileOper.onclick = function (event) {
		const inputControl = document.getElementById("targetPath");
		const outControl = document.getElementById("resultGetFileContent");
		const outText = readFileContent(document.location.origin, inputControl.value);
		let value = outText.then((data) => {
			ret = data; //todo validar necessidade
			outControl.value = ret;
		});
	};
}

function bindSetOperation(document) {
	const btnFileOper = document.getElementById("invokeSetFileContent");
	btnFileOper.onclick = function (event) {
		const targetControl = document.getElementById("targetPath");
		const contentControl = document.getElementById("resultGetFileContent");
		const txtContent = contentControl.value;
		const ret = writeFileContent(document.location.origin, targetControl.value, txtContent);
		ret.then((data) => {
			//Exibe msg de sucesso
			window.alert(data);
		}).catch((reason) => {
			const msg = `Falha no salvamento: ${reason.alert}`;
			window.alert(msg);
		});
	};
}

function bindExecOperation(document) {
	const btnExec = document.getElementById("execButton");
	btnExec.onclick = function (event) {
		const inputControl = document.getElementById("cmdText");
		const outputControl = document.getElementById("resultCmd");
		const cmdLine = inputControl.value;
		const ret = execCommand(document.location.origin, cmdLine);
		ret.then((data) => {
			outputControl.value = data;
		}).catch((reason) => {
			outputControl.value = `Falha na execução: ${reason.alert}`;
		});
	};
}

function bindControls(document) {
	bindGetOperation(document);
	bindSetOperation(document);
	bindExecOperation(document);
}
