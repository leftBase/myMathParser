const specialTokens = ["mporn*"];

export function tokenize(source) {
	const tokens = [];
	let index = 0;

	while (index < source.length) {
		const rest = source.slice(index);
		const special = specialTokens.find((value) => rest.startsWith(value));
		if (special) {
			tokens.push({ type: "identifier", value: special });
			index += special.length;
			continue;
		}

		const character = source[index];
		if (/\s/.test(character)) {
			index += 1;
			continue;
		}

		if (/[0-9]/.test(character)) {
			const match = rest.match(/^\d+(?:\.\d+)?/);
			tokens.push({ type: "number", value: match[0] });
			index += match[0].length;
			continue;
		}

		if (/[A-Za-z]/.test(character)) {
			const match = rest.match(/^[A-Za-z]+\d*/);
			tokens.push({ type: "identifier", value: match[0] });
			index += match[0].length;
			continue;
		}

		if ("+-*/^=".includes(character)) {
			tokens.push({ type: "operator", value: character });
			index += 1;
			continue;
		}

		if (character === "[" || character === "]" || character === "(") {
			tokens.push({ type: character === "[" ? "leftBracket" : character === "]" ? "rightBracket" : "leftParen", value: character });
			index += 1;
			continue;
		}

		if (character === ")") {
			tokens.push({ type: "rightParen", value: character });
			index += 1;
			continue;
		}

		if (/\p{Script=Hangul}/u.test(character)) {
			tokens.push({ type: "text", value: character });
			index += 1;
			continue;
		}

		tokens.push({ type: "text", value: character });
		index += 1;
	}

	return tokens;
}
