import {
	binaryNode,
	derivativeNode,
	functionNode,
	groupNode,
	identifierNode,
	integralNode,
	matrixNode,
	numberNode,
	operatorNode,
	rawNode,
	typedIntegralNode
} from "./ast.js";
import { tokenize } from "./tokenizer.js";

const functions = new Set(["sin", "cos", "tan", "log", "ln", "exp", "sqrt"]);
const aliases = new Set(["pi", "mu0", "lo", "x0", "theta", "alpha", "beta", "gamma"]);

export function parse(source) {
	const matrix = parseMatrix(source);
	if (matrix) return matrix;

	const tokens = tokenize(source);
	if (tokens.length === 0) return null;

	const parser = new Parser(tokens);
	const special = parser.parseSpecialExpression();
	if (special) {
		parser.expectEnd();
		return special;
	}

	const expression = parser.parseExpression();
	parser.expectEnd();
	return expression;
}

function parseMatrix(source) {
	const trimmed = source.trim();
	const explicitMatrix = /^mat\s*/i.test(trimmed);
	const bracketSource = explicitMatrix ? trimmed.replace(/^mat\s*/i, "") : trimmed;
	if (!bracketSource.startsWith("[") || !bracketSource.endsWith("]")) return null;

	const inner = bracketSource.slice(1, -1);
	if (!explicitMatrix && !inner.includes(";")) return null;
	const rows = [];
	let start = 0;
	let depth = 0;
	for (let index = 0; index < inner.length; index += 1) {
		if (inner[index] === "[") depth += 1;
		if (inner[index] === "]") depth -= 1;
		if (inner[index] === ";" && depth === 0) {
			rows.push(inner.slice(start, index).trim());
			start = index + 1;
		}
	}
	if (rows.length === 0 && !explicitMatrix) return null;
	rows.push(inner.slice(start).trim());
	if (rows.some((row) => row.length === 0)) throw new Error("행렬의 행이 비어 있습니다.");
	return matrixNode(rows.map((row) => row.split(/\s+/).filter(Boolean).map((cell) => parse(cell))));
}

class Parser {
	constructor(tokens) {
		this.tokens = tokens;
		this.position = 0;
	}

	current() {
		return this.tokens[this.position];
	}

	take() {
		const token = this.current();
		this.position += 1;
		return token;
	}

	is(value) {
		return this.current()?.value === value;
	}

	expect(value) {
		if (!this.is(value)) {
			throw new Error(`'${value}'가 필요합니다.`);
		}
		return this.take();
	}

	expectEnd() {
		if (this.current()) {
			throw new Error(`해석하지 못한 입력: ${this.current().value}`);
		}
	}

	parseSpecialExpression() {
		const values = this.tokens.map((token) => token.value);
		if (values.length === 5 && values[0] === "round" && values[2] === "/" && values[3] === "round") {
			this.position = 5;
			return derivativeNode(identifierNode(values[1]), identifierNode(values[4]));
		}
		if (values.length === 3 && values[0].startsWith("o") && values[1] === "/" && values[2].startsWith("o")) {
			this.position = 3;
			return derivativeNode(identifierNode(values[0].slice(1)), identifierNode(values[2].slice(1)));
		}
		return null;
	}

	parseExpression() {
		let expression = this.parseTerm();
		while (this.is("+") || this.is("-")) {
			const operator = this.take().value;
			expression = binaryNode(operator, expression, this.parseTerm());
		}
		return expression;
	}

	parseTerm() {
		let expression = this.parsePower();
		while (true) {
			if (this.is("*") || this.is("/")) {
				const operator = this.take().value;
				expression = binaryNode(operator, expression, this.parsePower());
				continue;
			}
			if (this.canStartPrimary()) {
				expression = binaryNode("*", expression, this.parsePower());
				continue;
			}
			return expression;
		}
	}

	parsePower() {
		const base = this.parsePrimary();
		if (this.is("^")) {
			this.take();
			return binaryNode("^", base, this.parsePower());
		}
		return base;
	}

	parsePrimary() {
		const token = this.current();
		if (!token) throw new Error("수식이 끝나기 전에 값이 필요합니다.");
		if (token.type === "number") {
			this.take();
			return numberNode(token.value);
		}
		if (token.type === "leftBracket" || token.type === "leftParen") {
			this.take();
			const expression = this.parseExpression();
			if (token.type === "leftBracket") this.expect("]");
			else this.expect(")");
			return groupNode(expression);
		}
		if (token.type !== "identifier") {
			throw new Error(`수식에서 '${token.value}'를 사용할 수 없습니다.`);
		}

		const name = this.take().value;
		if (name === "mporn*") return rawNode("m_p^* \\text{ or } m_n^*");
		if (["int", "intc", "ints"].includes(name)) return this.parseIntegral(name);
		if (["grad", "curl", "div", "laf"].includes(name)) {
			return operatorNode(name, this.parsePrimary());
		}
		if (name === "nabla") return operatorNode("del", this.canStartPrimary() ? this.parsePrimary() : null);
		if (name === "del") {
			if (this.is("dot") || this.is("cross")) {
				const operation = this.take().value;
				return operatorNode(`del-${operation}`, this.parsePrimary());
			}
			return operatorNode("del", this.canStartPrimary() ? this.parsePrimary() : null);
		}
		if (name === "round") return this.parseRoundDerivative();
		if (functions.has(name)) {
			return functionNode(name, this.parsePrimary());
		}
		const compactFunction = name.match(/^(sin|cos|tan|log|ln|exp)([A-Za-z]\d*)$/);
		if (compactFunction) return functionNode(compactFunction[1], identifierNode(compactFunction[2]));
		if (aliases.has(name)) return identifierNode(name);
		if (name === "pix") return binaryNode("*", identifierNode("pi"), identifierNode("x"));
		if (name.startsWith("o") && this.is("/") && this.tokens[this.position + 1]?.type === "identifier" && this.tokens[this.position + 1].value.startsWith("o")) {
			this.take();
			const denominator = this.take().value.slice(1);
			return derivativeNode(identifierNode(name.slice(1)), identifierNode(denominator));
		}
		if (/^[a-z]{2}$/.test(name)) {
			return binaryNode("*", identifierNode(name[0]), identifierNode(name[1]));
		}
		return identifierNode(name);
	}

	parseRoundDerivative() {
		const numerator = this.parsePrimary();
		this.expect("/");
		this.expect("round");
		return derivativeNode(numerator, this.parsePrimary());
	}

	parseIntegral(kind) {
		const body = this.parsePrimary();
		let differential = "x";
		if (this.current()?.type === "identifier" && this.current().value.startsWith("d")) {
			differential = this.take().value.slice(1) || "x";
		}
		return kind === "int" ? integralNode(body, differential) : typedIntegralNode(kind, body, differential);
	}

	canStartPrimary() {
		const token = this.current();
		return Boolean(token && (token.type === "number" || token.type === "identifier" || token.type === "leftBracket" || token.type === "leftParen"));
	}
}