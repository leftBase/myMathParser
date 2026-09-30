import { parse } from "./parser.js";
import { renderLatex, toLatex } from "./render.js";

const source = document.querySelector("#source");
const preview = document.querySelector("#preview");
const errorOutput = document.querySelector("#error-output");
const copyButton = document.querySelector("#copy-preview");
let currentLatex = "";

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
		currentLatex = latex;
		renderLatex(latex, preview);
	} catch (error) {
		preview.replaceChildren();
		currentLatex = "";
		errorOutput.textContent = error.message;
	}
}

source.addEventListener("input", update);
copyButton.addEventListener("click", async () => {
	if (!currentLatex || !preview.innerHTML) return;
	const renderedHtml = copyWithInlineStyles(preview);
	const html = `<div>${renderedHtml}</div>`;
	const text = `$$${currentLatex}$$`;
	if (navigator.clipboard?.write && window.ClipboardItem) {
		await navigator.clipboard.write([new ClipboardItem({
			"text/html": new Blob([html], { type: "text/html" }),
			"text/plain": new Blob([text], { type: "text/plain" }),
			"text/latex": new Blob([currentLatex], { type: "text/latex" })
		})]);
	} else {
		await navigator.clipboard.writeText(text);
	}
	copyButton.textContent = "복사됨";
	setTimeout(() => { copyButton.textContent = "미리보기 전체 복사"; }, 900);
});

function copyWithInlineStyles(element) {
	const clone = element.cloneNode(true);
	const originalElements = [element, ...element.querySelectorAll("*")];
	const clonedElements = [clone, ...clone.querySelectorAll("*")];
	for (let index = 0; index < originalElements.length; index += 1) {
		const computed = window.getComputedStyle(originalElements[index]);
		const styles = [
			"display", "position", "box-sizing", "width", "height", "margin", "padding",
			"color", "font-family", "font-size", "font-style", "font-weight", "line-height",
			"text-align", "vertical-align", "white-space", "border", "transform",
			"top", "right", "bottom", "left"
		];
		clonedElements[index].style.cssText = styles
			.map((property) => `${property}:${computed.getPropertyValue(property)}`)
			.join(";");
	}
	return clone.outerHTML;
}

update();
