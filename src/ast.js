export function numberNode(value) {
	return { type: "number", value };
}

export function identifierNode(name) {
	return { type: "identifier", name };
}

export function binaryNode(operator, left, right) {
	return { type: "binary", operator, left, right };
}

export function functionNode(name, argument) {
	return { type: "function", name, argument };
}

export function groupNode(expression) {
	return { type: "group", expression };
}

export function integralNode(body, differential) {
	return { type: "integral", body, differential };
}

export function derivativeNode(numerator, denominator) {
	return { type: "derivative", numerator, denominator };
}

export function operatorNode(operator, argument) {
	return { type: "operator", operator, argument };
}

export function rawNode(latex) {
	return { type: "raw", latex };
}
