import {
	binaryNode,
	derivativeNode,
	functionNode,
	groupNode,
	identifierNode,
	integralNode,
	numberNode,
	operatorNode,
	rawNode
} from "./ast.js";
import { tokenize } from "./tokenizer.js";

const functions = new Set(["sin", "cos", "tan", "log", "ln", "exp", "sqrt"]);
const aliases = new Set(["pi", "mu0", "lo", "x0", "theta", "alpha", "beta", "gamma"]);

export function parse(source) {
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
		if (name === "int") return this.parseIntegral();
		if (["grad", "curl", "div", "laf"].includes(name)) {
			return operatorNode(name, this.parsePrimary());
		}
		if (name === "del") {
			if (this.is("dot") || this.is("cross")) {
				const operation = this.take().value;
				return operatorNode(`del-${operation}`, this.parsePrimary());
			}
			return operatorNode("del", this.parsePrimary());
		}
		if (functions.has(name)) {
			const argument = this.is("[") || this.is("(") ? this.parsePrimary() : this.parsePrimary();
			return functionNode(name, argument);
		}
		if (aliases.has(name)) return identifierNode(name);
		if (name === "pix") return binaryNode("*", identifierNode("pi"), identifierNode("x"));
		if (/^[a-z]{2}$/.test(name)) {
			return binaryNode("*", identifierNode(name[0]), identifierNode(name[1]));
		}
		return identifierNode(name);
	}

	parseIntegral() {
		const body = this.parsePrimary();
		let differential = "x";
		if (this.current()?.type === "identifier" && this.current().value.startsWith("d")) {
			differential = this.take().value.slice(1) || "x";
		}
		return integralNode(body, differential);
	}

	canStartPrimary() {
		const token = this.current();
		return Boolean(token && (token.type === "number" || token.type === "identifier" || token.type === "leftBracket" || token.type === "leftParen"));
	}
}