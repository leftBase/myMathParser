# My Math Parser

개인 필기 습관에 맞춘 수식 입력기입니다. 입력 문자열을 토큰화하고 AST로 만든 뒤 LaTeX로 변환하여 KaTeX로 렌더링합니다.

## 실행

프로젝트 루트에서 다음 명령을 실행합니다.

```powershell
python -m http.server 4173
```

브라우저에서 [http://localhost:4173/renderer/index.html](http://localhost:4173/renderer/index.html)을 엽니다.

파일을 직접 열지 않고 정적 서버를 사용하는 이유는 브라우저의 ES module 보안 정책 때문입니다.

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
1. 기능
내 습관대로 수식 입력하면 토큰화하고, 그걸 수식문자로 파싱하고, 렌더해줌, 참고로 노트북같이 필기와 수식이 어우러져야하고 전체복사 후 노션 등에 붙여넣어도 문자가 유지되어야 함

2. 구현
KaTex가 렌더
입력의 토큰화, 파싱은 js 혹은 파이썬 혹은 c가 할텐데 자바스크립트 잘 모르지만 귀찮아지고 계산기도 아니니 js로 하기로

3. 파일 구조
main.js: 는 일렉트론으로 데탑 프로그램 만들때나 씁시다

src
    input.js:
    입력 받으면 tokenizer, parser, render, ast 호출해서 미리보기 실시간 갱신
    - 구분할때 한글은 그냥 두고 영어만 파싱할 준비하게 해야할까?

    ast.js:
    토큰과 데이터와 입력된 필기를 관리한다.
    - 데이터파일은 json일까?

    tokenizer.js:
    호출되어 쪼개 ast호출 한다

    parser.js:
    ast보고 LaTex로 고친다 

    render.js:
    LaTex를 KaTex로 렌더
    - 이곳에 KaTex 라이브러리를 사용하게 하면 되나?
    - 라이브러리 사용법을 모른다

renderer
    index.html:
    사용하는 웹페이지의 디자인

    style.css:


---

입력 규칙

sin(어떠한 내용)모양의 수식을 작성하려면
sin [ 어떠한 내용 ]
으로 쓴다

적분기호도 마찬가지로
int [ 내용 ] dx 라고 쓴다

int [ 내용 [내용] ] dx 등으로 표현되면 ()의 위계에 따라 {} 혹은 []를 적절히 사용해야 한다.

내용의 규칙: 곱하기 기호는 생략되며 곱하기는 붙여쓰기 혹은 띄어쓰기로 의미부여한다. 
예를 들어 3x, 3 x, pi x, pix, x y, xy는 모두 파싱할때 번역이 성공해야한다 참고, xy라는 변수는 쓰지않는다

변수규칙
mu0는 그리스자 뮤와 작은첨자0을 붙인것을 말한다
lo는 그리스자 로를 말한다
x0는 x_0를 말한다

변수규칙은 띄어쓰기가 없는 단어뭉치를 일대일 전환할 수 있어야한다. 도구를 주지말고 그냥 파일을 수정할수있어야한다 예를들어
mporn*는 
m_p ^* or m_n ^*로 번역되는 속기용 특수 규칙이 될 수 있다


편미분기호 round는 o를 사용한다
예를들어 round y / round x 는  oy/ox, oy / ox, oy/ ox, 모두 번역이 성공해야한다

nabla기호는 del을 번역하여 렌더되어야한다
grad x, curl x, del dot x, del cross x, laf(라플라스) x, div x 가 번역 되어야한다.
추가로 시간이 남으면 델 내적 x 등도 번역하게 한다. 토큰화 했을때 델, 내적, 주위에 다른 한글이 있으면 파싱하지 않는 방식으로 구현할 수 있을 것 같다

행렬은 [a b/ c d/ 34 o/ox]가 
a b
c d
34 round/roundx로
잘 번역되어야한다