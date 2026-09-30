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
		case "binary": return renderBinary(node);
		case "derivative": return `\\frac{\\partial ${toLatex(node.numerator)}}{\\partial ${toLatex(node.denominator)}}`;
		case "integral": return `\\int ${toLatex(unwrapGroup(node.body))}\\,d${toLatex({ type: "identifier", name: node.differential })}`;
		case "operator": return renderOperator(node);
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

function renderOperator(node) {
	const argument = toLatex(node.argument);
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