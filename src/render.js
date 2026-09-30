const latexAliases = {
	pi: "\\pi",
	mu0: "\\mu_0",
	lo: "\\rho",
	x0: "x_0",
	theta: "\\theta",
	alpha: "\\alpha",
	beta: "\\beta",
	gamma: "\\gamma"
};

export function toLatex(node) {
	if (!node) return "";
	switch (node.type) {
		case "number": return node.value;
		case "identifier": return latexAliases[node.name] ?? node.name;
		case "raw": return node.latex;
		case "group": return `\\left(${toLatex(node.expression)}\\right)`;
		case "function": return `\\${node.name}{${toLatex(node.argument)}}`;
		case "unary": return `${node.operator}${toLatex(node.argument)}`;
		case "subscript": return `${toLatex(node.base)}_{${toLatex(node.index)}}`;
		case "call": return `${node.name}\\left(${node.arguments.map(toLatex).join(", \\; ")}\\right)`;
		case "binary": return renderBinary(node);
		case "derivative": return `\\frac{\\partial ${toLatex(node.numerator)}}{\\partial ${toLatex(node.denominator)}}`;
		case "integral": return renderIntegral(node);
		case "operator": return renderOperator(node);
		case "matrix": return renderMatrix(node);
		default: throw new Error(`알 수 없는 AST 노드: ${node.type}`);
	}
}

function renderBinary(node) {
	const left = toLatex(node.left);
	const right = toLatex(node.right);
	if (node.operator === "/") return `\\frac{${left}}{${right}}`;
	if (node.operator === "^") return `{${left}}^{${right}}`;
	if (node.operator === "*") return `${left}\\,${right}`;
	return `${left} ${node.operator} ${right}`;
}

function renderIntegral(node) {
	const body = toLatex(unwrapGroup(node.body));
	const differential = `d${toLatex({ type: "identifier", name: node.differential })}`;
	if (node.kind === "oint") return `\\oint ${body}\\,${differential}`;
	if (node.kind === "ointc") return `\\oint_C ${body}\\,${differential}`;
	if (node.kind === "oints") return `\\oint_S ${body}\\,${differential}`;
	if (node.kind === "intc") return `\\int_C ${body}\\,${differential}`;
	if (node.kind === "ints") return `\\iint_S ${body}\\,${differential}`;
	return `\\int ${body}\\,${differential}`;
}

function renderMatrix(node) {
	const rows = node.rows.map((row) => row.map((cell) => toLatex(cell)).join(" & "));
	return `\\begin{bmatrix}${rows.join(" \\\\ ")}\\end{bmatrix}`;
}

function renderOperator(node) {
	const argument = toLatex(node.argument);
	if (node.operator === "vec") return `\\vec{\\mathbf{${argument}}}`;
	if (node.operator === "bar") return `\\overline{${argument}}`;
	if (node.operator === "hat") return `\\hat{${argument}}`;
	if (node.operator === "tild") return `\\tilde{${argument}}`;
	if (node.operator === "del") return `\\nabla ${argument}`;
	if (node.operator === "grad") return `\\nabla ${argument}`;
	if (node.operator === "curl") return `\\nabla \\times ${argument}`;
	if (node.operator === "div") return `\\nabla \\cdot ${argument}`;
	if (node.operator === "laf") return `\\nabla^2 ${argument}`;
	if (node.operator === "del-dot") return `\\nabla \\cdot ${argument}`;
	if (node.operator === "del-cross") return `\\nabla \\times ${argument}`;
	return argument;
}

export function renderLatex(latex, element) {
	if (!window.katex) throw new Error("KaTeX가 아직 로드되지 않았습니다.");
	window.katex.render(latex, element, {
		throwOnError: false,
		displayMode: true,
		trust: false
	});
}

function unwrapGroup(node) {
	return node.type === "group" ? node.expression : node;
}