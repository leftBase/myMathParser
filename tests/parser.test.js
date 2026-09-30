import assert from "node:assert/strict";
import { parse } from "../src/parser.js";
import { toLatex } from "../src/render.js";

const cases = [
  ["sin [ x + 1 ]", "\\sin{\\left(x + 1\\right)}"],
  ["int [ x^2 ] dx", "\\int {x}^{2}\\,dx"],
  ["3x", "3\\,x"],
  ["xy", "x\\,y"],
  ["mu0", "\\mu_0"],
  ["lo", "\\rho"],
  ["x0", "x_0"],
  ["oy / ox", "\\frac{\\partial y}{\\partial x}"],
  ["round y / round x", "\\frac{\\partial y}{\\partial x}"],
  ["del dot x", "\\nabla \\cdot x"],
  ["del cross x", "\\nabla \\times x"],
  ["grad x", "\\nabla x"],
  ["curl x", "\\nabla \\times x"],
  ["div x", "\\nabla \\cdot x"],
  ["laf x", "\\nabla^2 x"],
  ["mporn*", "m_p^* \\text{ or } m_n^*"]
];

for (const [source, expected] of cases) {
  assert.equal(toLatex(parse(source)), expected, source);
}

assert.throws(() => parse("sin [ x"), /'\]'가 필요합니다/);
console.log(`통과: ${cases.length + 1}개 parser 테스트`);