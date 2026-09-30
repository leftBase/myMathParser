import assert from "node:assert/strict";
import { parse } from "../src/parser.js";
import { toLatex } from "../src/render.js";

const cases = [
  ["sin [ x + 1 ]", "\\sin{\\left(x + 1\\right)}"],
  ["int [ x^2 ] dx", "\\int {x}^{2}\\,dx"],
  ["int [sint] dt", "\\int \\sin{t}\\,dt"],
  ["int t dt", "\\int t\\,dt"],
  ["intc [f] ds", "\\int_C f\\,ds"],
  ["ints [f] dS", "\\iint_S f\\,dS"],
  ["oint [f] ds", "\\oint f\\,ds"],
  ["ointc [f] dc", "\\oint_C f\\,dc"],
  ["oints [f] dS", "\\oint_S f\\,dS"],
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
  ["nabla x", "\\nabla x"],
  ["x = y", "x = y"],
  ["f_x", "f_{x}"],
  ["f_1", "f_{1}"],
  ["f[x,y,z]", "f\\left(x, \\; y, \\; z\\right)"],
  ["f [x, y, z]", "f\\left(x, \\; y, \\; z\\right)"],
  ["-x", "-x"],
  ["-x^2", "-{x}^{2}"],
  ["F=-gradV+curlA", "F = -\\nabla V + \\nabla \\times A"],
  ["F = - grad V + curl A", "F = -\\nabla V + \\nabla \\times A"],
  ["vec B", "\\vec{\\mathbf{B}}"],
  ["vecB", "\\vec{\\mathbf{B}}"],
  ["bar B", "\\overline{B}"],
  ["barB", "\\overline{B}"],
  ["r hat", "\\hat{r}"],
  ["rhat", "\\hat{r}"],
  ["tild x", "\\tilde{x}"],
  ["tildx", "\\tilde{x}"],
  ["del", "\\nabla "],
  ["mat [a b; c d]", "\\begin{bmatrix}a & b \\\\ c & d\\end{bmatrix}"],
  ["mat[a b;c d;34 oy/ox]", "\\begin{bmatrix}a & b \\\\ c & d \\\\ 34 & \\frac{\\partial y}{\\partial x}\\end{bmatrix}"],
  ["[a b; c d]", "\\begin{bmatrix}a & b \\\\ c & d\\end{bmatrix}"],
  ["mporn*", "m_p^* \\text{ or } m_n^*"]
];

for (const [source, expected] of cases) {
  assert.equal(toLatex(parse(source)), expected, source);
}

assert.throws(() => parse("sin [ x"), /'\]'가 필요합니다/);
console.log(`통과: ${cases.length + 1}개 parser 테스트`);