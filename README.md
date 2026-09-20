# jayio-site

Site institucional do [jayio](https://jayio.app). Estático, sem build, sem
dependência de runtime: duas páginas, uma folha de estilo, um script e as
imagens.

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
index.html              a página principal, com o sprite dos glifos
precos.html             planos, comparativo e perguntas
assets/css/site.css     tokens de tema, tipografia, layout
assets/js/virada.js     a simulação da virada (FLIP) e o seletor de tema
assets/img/             logo, arte do gaio em avif/webp, favicons
```

As duas páginas carregam o mesmo `virada.js`. Ele resolve o tema primeiro e só
depois procura o quadro da simulação, saindo cedo quando não existe, então em
`precos.html` sobra só o botão de tema.

O sprite dos 14 glifos está duplicado no topo das duas páginas, porque `<use>`
não alcança um arquivo externo sem CORS. Mudou um ícone, muda nos dois.

Não há framework, bundler nem passo de build.

## Publicar

GitHub Pages serve a raiz da branch `master`, e o `CNAME` amarra o domínio.
Publicar é dar `git push`.

## Documentação

O contexto do site (as regras da virada que a página simula, a iconografia, as
decisões de construção, o arranjo do Pages e o DNS) está na base de
conhecimento, em `~/obsidian/jayio/site.md`. As decisões por trás dos preços,
em `~/obsidian/jayio/planos-e-precos.md`.
