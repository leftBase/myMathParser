import { parse } from "./parser.js";
import { renderLatex, toLatex } from "./render.js";

const source = document.querySelector("#source");
const preview = document.querySelector("#preview");
const errorOutput = document.querySelector("#error-output");
const copyButton = document.querySelector("#copy-preview");

function update() {
	const value = source.value.trim();
	errorOutput.textContent = "";
	if (!value) {
		preview.replaceChildren();
		return;
	}

	try {
		const ast = parse(value);
		const latex = toLatex(ast);
		renderLatex(latex, preview);
	} catch (error) {
		preview.replaceChildren();
		errorOutput.textContent = error.message;
	}
}

source.addEventListener("input", update);
copyButton.addEventListener("click", async () => {
	if (!source.value.trim() || !preview.innerHTML) return;
	const html = `<div>${preview.innerHTML}</div>`;
	const text = source.value;
	if (navigator.clipboard?.write && window.ClipboardItem) {
		await navigator.clipboard.write([new ClipboardItem({
			"text/html": new Blob([html], { type: "text/html" }),
			"text/plain": new Blob([text], { type: "text/plain" })
		})]);
	} else {
		await navigator.clipboard.writeText(text);
	}
	copyButton.textContent = "복사됨";
	setTimeout(() => { copyButton.textContent = "미리보기 전체 복사"; }, 900);
});

update();
