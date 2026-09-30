import { parse } from "./parser.js";
import { renderLatex, toLatex } from "./render.js";

const source = document.querySelector("#source");
const preview = document.querySelector("#preview");
const latexOutput = document.querySelector("#latex-output");
const errorOutput = document.querySelector("#error-output");
const copyButton = document.querySelector("#copy-latex");

function update() {
	const value = source.value.trim();
	errorOutput.textContent = "";
	if (!value) {
		preview.replaceChildren();
		latexOutput.textContent = "";
		return;
	}

	try {
		const ast = parse(value);
		const latex = toLatex(ast);
		renderLatex(latex, preview);
		latexOutput.textContent = latex;
	} catch (error) {
		preview.replaceChildren();
		latexOutput.textContent = "";
		errorOutput.textContent = error.message;
	}
}

source.addEventListener("input", update);
copyButton.addEventListener("click", async () => {
	if (!latexOutput.textContent) return;
	await navigator.clipboard.writeText(latexOutput.textContent);
	copyButton.textContent = "복사됨";
	setTimeout(() => { copyButton.textContent = "LaTeX 복사"; }, 900);
});

update();
