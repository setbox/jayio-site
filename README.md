# jayio-site

Site institucional do [jayio](https://jayio.app). Estático, sem build, sem
dependência de runtime: duas páginas em dois idiomas, uma folha de estilo, um
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
sitemap.xml             as quatro páginas, com os pares de idioma em xhtml:link
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

As quatro páginas carregam o mesmo `virada.js`. Ele decide o idioma pelo `lang`
do documento, resolve o tema e só depois procura o quadro da simulação, saindo
cedo quando não existe, então nas páginas de preço sobra só o botão de tema e o
trocador de idioma.

O sprite dos 14 glifos está duplicado no topo das quatro páginas, porque `<use>`
não alcança um arquivo externo sem CORS. Mudou um ícone, muda nos quatro.

Toda mudança de texto acontece duas vezes, uma por idioma, e os textos da
simulação ficam na tabela `TEXTOS` do `virada.js`, não no HTML.

O `sitemap.xml` traz as quatro páginas com os mesmos pares de idioma que os
`<link rel="alternate">` do `<head>` declaram, e cada `<loc>` carrega o
`hreflang` dos dois lados mais o `x-default` no inglês. Mudou uma página, o
`<lastmod>` dela acompanha; entrou uma página nova, entra nos dois lugares.

Não há framework, bundler nem passo de build.

## Publicar

GitHub Pages serve a raiz da branch `master`, e o `CNAME` amarra o domínio.
Publicar é dar `git push`.

## Documentação

O contexto do site (as regras da virada que a página simula, a iconografia, as
decisões de construção, o arranjo do Pages e o DNS) está na base de
conhecimento, em `~/obsidian/jayio/site.md`. As decisões por trás dos preços,
em `~/obsidian/jayio/planos-e-precos.md`.
