# My Math Parser

개인 필기 습관에 맞춘 수식 입력기입니다. 입력 문자열을 토큰화하고 AST로 만든 뒤 LaTeX로 변환하여 KaTeX로 렌더링합니다.

## 실행

https://leftbase.github.io/myMathParser/renderer/index.html
## 개발 테스트

```powershell
npm test
```

## 처리 흐름

```text
입력 문자열
    -> tokenizer.js
    -> parser.js
    -> ast.js의 AST
    -> render.js의 LaTeX
    -> KaTeX 미리보기
```

## 현재 지원 문법

```text
sin [ x + 1 ]
cos [ x ]
int [ x^2 ] dx
int [sint] dt
int t dt
intc [f] ds
ints [f] dS
3x
3 x
xy
pi x
mu0
lo
x0
oy / ox
round y / round x
del
grad x
curl x
div x
laf x
nabla x
mat [a b; c d]
mat[a b; c d; 34 oy/ox]
del dot x
del cross x
mporn*
```

주요 변환은 다음과 같습니다.

```text
mu0       -> \mu_0
lo        -> \rho
x0        -> x_0
oy / ox   -> \frac{\partial y}{\partial x}
del       -> \nabla
grad x    -> \nabla x
curl x    -> \nabla \times x
div x     -> \nabla \cdot x
laf x     -> \nabla^2 x
intc      -> \int_C f\,ds
ints      -> \iint_S f\,dS
nabla x   -> \nabla x
행렬      -> mat [a b; c d]
mporn*    -> m_p^* \text{ or } m_n^*
```

`mporn*`은 현재 요청대로 전체가 하나의 개인 매크로로 처리됩니다.

## 파일 역할

- `src/tokenizer.js`: 입력을 숫자, 식별자, 연산자, 괄호 토큰으로 분리
- `src/ast.js`: AST 노드를 만드는 함수 제공
- `src/parser.js`: 토큰을 수식 AST로 변환
- `src/render.js`: AST를 LaTeX로 변환하고 KaTeX 호출
- `src/input.js`: DOM 입력 이벤트와 미리보기 연결
- `renderer/index.html`: 화면 구조와 KaTeX CDN 연결
- `renderer/style.css`: 편집기 화면 스타일

현재 UI는 왼쪽 입력창과 오른쪽 미리보기로 구성되어 있습니다. 이후 노트북 기능을 확장할 때는 입력을 텍스트 블록과 수식 블록의 배열로 분리하면 됩니다.