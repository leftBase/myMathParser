import { parse } from "./parser.js";
import { renderLatex, toLatex } from "./render.js";

const source = document.querySelector("#source");
const preview = document.querySelector("#preview");
const errorOutput = document.querySelector("#error-output");
const copyButton = document.querySelector("#copy-preview");
const latexCopyButton = document.querySelector("#copy-latex");
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
latexCopyButton.addEventListener("click", async () => {
	if (!currentLatex) return;
	await navigator.clipboard.writeText(currentLatex);
	latexCopyButton.textContent = "복사됨";
	setTimeout(() => { latexCopyButton.textContent = "인라인 LaTeX 복사"; }, 900);
});

copyButton.addEventListener("click", async () => {
	if (!currentLatex || !preview.innerHTML) return;
	const text = `$$${currentLatex}$$`;
	try {
		const image = await createEquationPng(preview);
		if (navigator.clipboard?.write && window.ClipboardItem && image) {
			await navigator.clipboard.write([new ClipboardItem({
				"image/png": image
			})]);
		} else {
			await navigator.clipboard.writeText(text);
		}
	} catch (error) {
		await navigator.clipboard.writeText(text);
	}
	copyButton.textContent = "복사됨";
	setTimeout(() => { copyButton.textContent = "미리보기 이미지 복사"; }, 900);
});

async function createEquationPng(element) {
	const equation = element.querySelector(".katex") ?? element;
	const bounds = equation.getBoundingClientRect();
	const padding = 24;
	const width = Math.max(1, Math.ceil(bounds.width + padding * 2));
	const height = Math.max(1, Math.ceil(bounds.height + padding * 2));
	const clone = copyWithInlineStyles(equation, true);
	clone.style.cssText += `;display:inline-block;margin:0;color:#111;`;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="${width}" height="${height}"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="box-sizing:border-box;width:100%;height:100%;padding:${padding}px;background:#fff;color:#111;">${clone.outerHTML}</div></foreignObject></svg>`;
	const image = new Image();
	image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	await image.decode();
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.getContext("2d").drawImage(image, 0, 0);
	return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function copyWithInlineStyles(element, forceBlack) {
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
		if (forceBlack) clonedElements[index].style.color = "#111";
	}
	return clone;
}

update();
