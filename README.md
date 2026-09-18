# jayio-site

Site institucional do [jayio](https://jayio.app). Estático, sem build, sem
dependência de runtime: três arquivos e as imagens.

## A ideia

O jayio tem um mecanismo que quase nenhum gerenciador de tarefas tem: **à
meia-noite do fuso de cada pessoa, o Hoje se esvazia**. O que ficou pela metade
volta à reserva, o concluído vai ao arquivo, o que estava marcado para amanhã
sobe.

O site não descreve isso em bullet point. Ele **roda as quatro regras na frente
de quem está lendo**, com os mesmos critérios e na mesma ordem do worker da
virada no servidor:

| # | Regra | Critério |
|---|---|---|
| 1 | arquiva | `bucket ≠ a` e `status ∈ {c, x}` → `bucket = a` |
| 2 | devolve | `bucket = t` e `status ∉ {c, x, t}` → `bucket = b`, `status = u` |
| 3 | promove | `status = t` → `bucket = t`, `status = u` |
| 4 | solta | tem data ≤ hoje e `bucket ≠ a` → `bucket = t`, data limpa |

A ordem importa: a regra 2 exclui o status `t` de propósito, senão quem marcou
"para amanhã" cairia na reserva antes da regra 3 poder promovê-lo.

## A iconografia

O jayio tem um sistema de símbolo de dois eixos, e ele é o coração da interface:

- **a forma diz o domínio** — círculo é pessoal (`o`), quadrado é profissional (`p`);
- **a marca por dentro diz o andamento** — vazio não iniciada, meia preenchida
  iniciada, diagonal bloqueada, seta para amanhã, cheia concluída, xis cancelada.

São 14 glifos, `{o,p} × {u,ub,s,b,t,c,x}`, e no formulário do app o glifo **é** o
controle, não uma ilustração dele: trocar a forma redesenha a régua inteira dos
sete andamentos. O site reproduz essa régua, interativa, em *Um símbolo, dois
eixos*.

Os glifos aqui são **redesenhados**, não copiados de `priv/static/images/icons`.
Motivo: os originais têm `stroke="#000"` e `fill="#fff"` fixos, então sumiriam no
tema escuro, além de carregarem `stroke-opacity="NaN"` e um path residual fora do
viewBox. A geometria é a mesma (círculo r=194 em 200,200; quadrado 5,5,390,390),
só que em `currentColor`, num sprite inline de 17 símbolos, incluindo os três
ícones de período (sol, relógio, lua).

**O site não mostra código de estado em lugar nenhum.** Nem `u`, nem `ub`, nem
`x`, e nem o nome do andamento ao lado de cada glifo na régua. Quem fala é o
desenho, como no app: os sete botões do `state_band` são `<img>` com `alt` e
`title`, sem texto visível, e o nome aparece só na leitura do símbolo escolhido
("Profissional, bloqueada"). Os códigos sobrevivem em dois lugares legítimos, o
payload JSON da seção da API e este README, porque lá eles são o contrato.

**Ao mudar um ícone no app, mudar aqui também.** O sprite está no topo do
`index.html`.

O resto da linguagem vem do nome. Jay é o gaio, *Garrulus glandarius*, o pássaro
que enterra bolotas no outono e volta para desenterrar. A reserva do jayio é a
despensa do gaio, e a arte em aquarela é a mesma que a tela de login usa.

## Rodar

Servir por HTTP, não abrir o arquivo direto:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

Abrir `index.html` por `file://` mostra a página, mas **sem os divisores**: o
Chrome recusa carregar uma máscara CSS externa nesse esquema e devolve
`net::ERR_FAILED`. Não é defeito do site, é restrição de origem do navegador.

## Estrutura

```
index.html              página única
assets/css/site.css     tokens de tema, tipografia, layout
assets/js/virada.js     a simulação da virada (FLIP) e o seletor de tema
assets/img/             logo, arte do gaio em avif/webp, favicons
```

Não há framework, bundler nem passo de build. A única coisa externa é a fonte
Shantell Sans, no Google Fonts; caindo a rede, o fallback cursivo assume.

## Decisões

- **Sem build.** O site muda pouco e precisa carregar rápido. Um `npm install`
  aqui só criaria manutenção.
- **Tema por token CSS.** Claro e escuro saem das mesmas variáveis, com o
  sistema decidindo por padrão e o botão sobrescrevendo em `localStorage`. Toda
  leitura de storage está em `try/catch`: aba anônima devolve erro.
- **Animação opcional.** Com `prefers-reduced-motion` a virada acontece sem
  interpolação, direto no estado final.
- **Imagens em `avif` e `webp`**, com `srcset` em três larguras. A arte do gaio
  é o arquivo mais pesado da página.
- **Vocabulário do produto, não sinônimos.** O balde `b` chama-se **Reserva**
  em português (o `msgstr` do `pt_BR`) e "Backlog" em inglês. O site segue o
  app; se o rótulo mudar lá, muda aqui.
- **Rótulos vindos do app.** "Não iniciada", "Para amanhã",
  "Bloqueada" e o resto saem do `pt_BR/LC_MESSAGES/default.po` do app. O cartão
  do quadro tem a mesma anatomia do cartão real: glifo, descrição, ícone de
  período e labels, sem badge de status.

## Rodapé e marca

O jayio é um produto da **Setbox**, e o rodapé segue o mesmo formato do
[pjpark.com.br](https://pjpark.com.br): três colunas de links, a marca da Setbox
clicável e a linha legal.

```
© 2026 Setbox Serviços Digitais·CNPJ 08.889.601/0001-09
Av. Carneiro Leão, 563 - Zona 01, Maringá / PR - 87014-010
```

A marca (`assets/img/setbox.png`) existe numa versão só, com o "Setbox" preto e a
caixa vermelha. No tema escuro ela vai sobre uma placa clara em vez de receber
filtro: `invert()` levaria o vermelho da Setbox para salmão, e marca de terceiro
não se recolore.


## Publicar

O site é servido pelo **GitHub Pages**, no mesmo arranjo do `integramoda-site`:
sem workflow, sem build, sem branch `gh-pages`. O Pages publica a raiz da
branch `master` de [`setbox/jayio-site`](https://github.com/setbox/jayio-site)
e o arquivo `CNAME` amarra o domínio.

```
CNAME                   jayio.app
Pages source            branch master, path /
HTTPS                   enforced (certificado emitido pelo próprio Pages)
```

Publicar é dar `git push`: o Pages reconstrói a cada commit na `master`.

O DNS do apex precisa apontar para os endereços do Pages, e o app fica em um
subdomínio próprio:

| Nome | Tipo | Valor |
|---|---|---|
| `@` | A | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `@` | AAAA | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `app` | — | a VPS que roda o jayio |

O apex é do site e `app.jayio.app` é do produto: os botões "Entrar" e "Abrir o
jayio" apontam para lá. Se o app mudar de endereço, mudam as quatro ocorrências
no `index.html`.

O repositório precisa ser público. A organização está no plano free do GitHub, e
nele o Pages só serve repositório público — o `integramoda-site` já é assim.

Qualquer outro host estático também serve. Os caminhos internos são relativos,
então o site funciona na raiz de um domínio ou num subdiretório; só `og:image`,
`og:url` e o `canonical` são absolutos, porque scraper de rede social não resolve
caminho relativo.

## Manutenção

O divisor de seção (`assets/img/fio.png`) é uma silhueta em fundo transparente
usada como `mask-image`: o canal alfa faz o recorte e a cor sai do CSS, então
ele acompanha o tema sem precisar de uma arte clara e outra escura. Para trocar
o desenho, basta substituir o PNG mantendo o fundo transparente.

Dois pontos exigem sincronia com o app:

1. `assets/js/virada.js` — a simulação reproduz as regras da virada. Se elas
   mudarem no servidor, a simulação muda junto.
2. o sprite de glifos no `index.html` — se a iconografia do app mudar, ela muda
   aqui também, para o site ensinar o mesmo alfabeto que o produto fala.

O site não cita tecnologia interna: nem linguagem, nem framework, nem banco.
O que aparece é superfície de produto — API REST, MCP, token, escopo —, porque
é contrato com quem integra. Este README segue a mesma regra.
