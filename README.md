# jayio-site

Site institucional do [jayio](https://jayio.app). Estático, sem build, sem
dependência de runtime: três páginas em dois idiomas, uma folha de estilo, um
script e as imagens.

## Rodar

Servir por HTTP, não abrir o arquivo direto:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

Por `file://` a página aparece sem os divisores: o navegador recusa carregar a
máscara CSS externa nesse esquema.

## Estrutura

```
index.html              a página principal, em inglês
pricing.html            planos, comparativo e perguntas, em inglês
pt/index.html           a página principal, em português
pt/precos.html          planos, comparativo e perguntas, em português
connect-ai.html         o que são o MCP e a API, sem jargão, em inglês
pt/conectar-ia.html     o que são o MCP e a API, sem jargão, em português
sitemap.xml             as seis páginas, com os pares de idioma em xhtml:link
robots.txt              libera tudo e aponta o sitemap
assets/css/site.css     tokens de tema, tipografia, layout
assets/js/virada.js     a simulação da virada (FLIP), o tema e os textos dos dois idiomas
assets/img/             logo, arte do gaio em avif/webp, favicons
```

O inglês fica na raiz e o português em `/pt/`. O GitHub Pages não negocia idioma
no servidor, então as páginas em inglês trazem um script curto no `<head>` que
manda para `/pt/` quem tem o navegador em português e nunca escolheu. A escolha
fica em `localStorage` sob `jayio-idioma` e ganha do navegador; as páginas em
`/pt/` nunca redirecionam, para não existir laço.

As seis páginas carregam o mesmo `virada.js`. Ele decide o idioma pelo `lang`
do documento, resolve o tema e só depois procura o quadro da simulação, saindo
cedo quando não existe, então nas páginas de preço sobra só o botão de tema e o
trocador de idioma.

O sprite dos 14 glifos está duplicado no topo das seis páginas, porque `<use>`
não alcança um arquivo externo sem CORS. Mudou um ícone, muda nas seis.

Toda mudança de texto acontece duas vezes, uma por idioma, e os textos da
simulação ficam na tabela `TEXTOS` do `virada.js`, não no HTML.

O `sitemap.xml` traz as seis páginas com os mesmos pares de idioma que os
`<link rel="alternate">` do `<head>` declaram, e cada `<loc>` carrega o
`hreflang` dos dois lados mais o `x-default` no inglês. Mudou uma página, o
`<lastmod>` dela acompanha; entrou uma página nova, entra nos dois lugares.

Não há framework, bundler nem passo de build.

## Texto para quem não é técnico

MCP e API aparecem pelo que fazem, não pela sigla. A sigla vem depois, entre
parênteses, e a explicação longa mora em `connect-ai.html` /
`pt/conectar-ia.html`, para onde apontam o rodapé ("Connect AI" / "Conectar
IA"), a linha do plano pro e a seção MCP/REST da página principal. O app linka
a mesma página, no idioma da interface.

| Sigla | Nome para leigo | Uma linha |
|---|---|---|
| MCP | Seu assistente de IA / Your AI assistant | O jeito padrão de um assistente de IA usar outros apps por você. |
| API REST | Outros sistemas / Other systems | A porta de entrada para programas: quem programa ou automatiza liga o jayio a outros sistemas. |

A página diz com quais assistentes funciona hoje: os que aceitam servidor MCP
remoto com endereço e token (Claude Code, Cursor). Conector que exige OAuth,
como o do Claude.ai e o do ChatGPT, ainda não. Se o app ganhar OAuth, essa
resposta muda nas duas línguas.

As listas se chamam "lista de Hoje" e "lista de Reserva" ("Today list",
"Backlog list"), nunca "o seu Hoje" ou "a Reserva" soltos. Rótulo de botão
citado entre aspas fica como aparece na tela.
Quando a frase já fala de outro dia ("Amanhã…"), "lista de Hoje" briga com
ele; aí vale "lista do dia" ("list for the day"), como no fechamento da página
principal.

## Ações e pesos

Um botão cheio por tela, e ele é sempre a ação que converte:
"Começar grátis" / "Start free", que leva a `app.jayio.app/users/register`.

- Topo: "Planos" é link de texto e "Entrar" é o único botão, de contorno, e vai
  direto a `/users/log-in`. Quem já tem conta acha; quem chega não se distrai.
  Abaixo de 380px o link de planos sai do topo.
- Abertura: "Começar grátis" cheio e "Ver o dia virar ↓" como link de texto,
  porque só rola a página.
- Fechamento das três páginas: o mesmo "Começar grátis", com o mesmo nome.
- Botões dos planos ("Começar", "Assinar") também levam ao cadastro.

## Publicar

GitHub Pages serve a raiz da branch `master`, e o `CNAME` amarra o domínio.
Publicar é dar `git push`.

## Documentação

O contexto do site (as regras da virada que a página simula, a iconografia, as
decisões de construção, o arranjo do Pages e o DNS) está na base de
conhecimento, em `~/obsidian/jayio/site.md`. As decisões por trás dos preços,
em `~/obsidian/jayio/planos-e-precos.md`.
