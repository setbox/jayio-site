/* =========================================================================
   A virada do dia, rodando no navegador.

   As quatro operações abaixo são as mesmas do worker do jayio, na mesma ordem.
   Nada aqui é enfeite: se a regra 2 excluísse o status `t`, a tarefa marcada
   para amanhã cairia na reserva em vez de voltar ao topo do Hoje.
   ========================================================================= */

(function () {
  "use strict";

  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------- idioma --- */

  /* O site tem uma árvore de arquivos por idioma, então quem manda aqui é o
     `lang` do documento, não o navegador: a página em /pt/ fala português mesmo
     para quem chegou nela de propósito com o navegador em inglês. */

  var TEXTOS = {
    pt: {
      tema: { claro: "Escurecer", escuro: "Clarear" },
      rotulo: {
        u: "Não iniciada",
        ub: "Não iniciada, bloqueada",
        s: "Iniciada",
        b: "Bloqueada",
        t: "Para amanhã",
        c: "Concluída",
        x: "Cancelada"
      },
      tipo: { o: "Pessoal", p: "Profissional" },
      periodo: { m: "Manhã", a: "Tarde", n: "Noite" },
      tarefas: {
        t1: { txt: "Fechar o relatório do trimestre", tags: ["trabalho"] },
        t2: { txt: "Responder o e-mail do chefe" },
        t3: { txt: "Comprar ração", tags: ["casa"] },
        t4: { txt: "Revisar o PR do time" },
        t5: { txt: "Agendar dentista", tags: ["saúde"] },
        t6: { txt: "Estudar para a certificação", tags: ["estudo"] },
        b1: { txt: "Trocar o pneu", tags: ["carro"], data: "amanhã" },
        b2: { txt: "Renovar o passaporte" },
        b3: { txt: "Organizar as fotos" },
        b4: { txt: "Concluir desenvolvimento", tags: ["dinheiro"] },
        a1: { txt: "Pagar o IPTU" }
      },
      saldo: { nenhuma: "nenhuma", uma: "1 tarefa", varias: " tarefas" },
      passos: [
        "Concluída e cancelada saem de cena: viram histórico, não peso.",
        "O que sobrou do Hoje volta à reserva e ao estado inicial. Ninguém carrega culpa de ontem.",
        "“Para amanhã” virou hoje. Sobe limpa, como se tivesse acabado de ser escrita.",
        "A bolota enterrada com data chegou ao dia. Sobe e perde a data, para não subir de novo amanhã."
      ],
      fim: "Fim. O Hoje recomeça com três tarefas escolhidas, não com a sobra de ontem.",
      inicio: "Três cartões estão marcados para amanhã ou agendados. Repare para onde eles vão."
    },

    en: {
      tema: { claro: "Darken", escuro: "Lighten" },
      rotulo: {
        u: "Not started",
        ub: "Unstarted blocked",
        s: "Started",
        b: "Blocked",
        t: "For tomorrow",
        c: "Completed",
        x: "Cancelled"
      },
      tipo: { o: "Personal", p: "Professional" },
      periodo: { m: "Morning", a: "Afternoon", n: "Night" },
      tarefas: {
        t1: { txt: "Close the quarterly report", tags: ["work"] },
        t2: { txt: "Reply to the boss" },
        t3: { txt: "Buy pet food", tags: ["home"] },
        t4: { txt: "Review the team PR" },
        t5: { txt: "Book the dentist", tags: ["health"] },
        t6: { txt: "Study for the certification", tags: ["study"] },
        b1: { txt: "Change the tyre", tags: ["car"], data: "tomorrow" },
        b2: { txt: "Renew the passport" },
        b3: { txt: "Sort out the photos" },
        b4: { txt: "Finish the build", tags: ["money"] },
        a1: { txt: "Pay the council tax" }
      },
      saldo: { nenhuma: "none", uma: "1 task", varias: " tasks" },
      passos: [
        "Completed and cancelled leave the stage: they become archive, not weight.",
        "Whatever is left of Today goes back to the backlog and to its starting state. Nobody carries yesterday's guilt.",
        "“For tomorrow” just became today. It moves up clean, as if it had only now been written.",
        "The acorn buried with a date reached its day. It moves up and loses the date, so it is not promoted again tomorrow."
      ],
      fim: "That is it. Today starts again with three chosen tasks, not with what was left of yesterday.",
      inicio: "Three cards are marked for tomorrow or scheduled. Watch where they go."
    }
  };

  var T = /^pt\b/i.test(document.documentElement.lang || "") ? TEXTOS.pt : TEXTOS.en;

  /* A escolha de idioma é lembrada aqui, e é ela que o portão no <head> das
     páginas em inglês consulta antes de olhar o navegador. */
  Array.prototype.forEach.call(document.querySelectorAll("[data-idioma]"), function (a) {
    a.addEventListener("click", function () {
      try { localStorage.setItem("jayio-idioma", a.getAttribute("data-idioma")); } catch (e) {}
    });
  });

  /* ------------------------------------------------------------- tema --- */

  var alvoTema = document.querySelector("[data-tema-toggle]");

  function lerTema() {
    try { return localStorage.getItem("jayio-tema"); } catch (e) { return null; }
  }

  function gravarTema(valor) {
    try { localStorage.setItem("jayio-tema", valor); } catch (e) { /* aba anônima */ }
  }

  function escuroAgora() {
    var atual = document.documentElement.getAttribute("data-tema");
    if (atual) return atual === "escuro";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function pintarBotaoTema() {
    if (!alvoTema) return;
    var escuro = escuroAgora();
    alvoTema.setAttribute("aria-pressed", String(escuro));
    var txt = alvoTema.querySelector(".btn-tema-txt");
    if (txt) txt.textContent = escuro ? T.tema.escuro : T.tema.claro;
  }

  var salvo = lerTema();
  if (salvo === "claro" || salvo === "escuro") {
    document.documentElement.setAttribute("data-tema", salvo);
  }
  pintarBotaoTema();

  if (alvoTema) {
    alvoTema.addEventListener("click", function () {
      var proximo = escuroAgora() ? "claro" : "escuro";
      document.documentElement.setAttribute("data-tema", proximo);
      gravarTema(proximo);
      pintarBotaoTema();
    });
  }

  /* ------------------------------------------------------------ fuso ---- */

  var elFuso = document.querySelector("[data-fuso]");
  if (elFuso) {
    try {
      var fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (fuso) elFuso.textContent = fuso;
    } catch (e) { /* fica o padrão do HTML */ }
  }

  /* ----------------------------------------------------------- estado --- */

  var quadro = document.querySelector("[data-quadro]");
  if (!quadro) return;

  var SEMENTE = [
    { id: "t1", bucket: "t", st: "s",  tipo: "p", periodo: "m" },
    { id: "t2", bucket: "t", st: "c",  tipo: "p" },
    { id: "t3", bucket: "t", st: "u",  tipo: "o", periodo: "a" },
    { id: "t4", bucket: "t", st: "x",  tipo: "p" },
    { id: "t5", bucket: "t", st: "t",  tipo: "o", periodo: "m" },
    { id: "t6", bucket: "t", st: "b",  tipo: "o", periodo: "n" },

    { id: "b1", bucket: "b", st: "u",  tipo: "o", periodo: "m" },
    { id: "b2", bucket: "b", st: "t",  tipo: "o" },
    { id: "b3", bucket: "b", st: "u",  tipo: "o" },
    { id: "b4", bucket: "b", st: "u",  tipo: "p" },

    { id: "a1", bucket: "a", st: "c",  tipo: "o" }
  ].map(function (t) {
    var texto = T.tarefas[t.id];
    t.txt = texto.txt;
    t.tags = texto.tags || [];
    if (texto.data) t.data = texto.data;
    return t;
  });

  var tarefas = [];
  var rodando = false;

  function semear() {
    tarefas = SEMENTE.map(function (t) {
      return { id: t.id, txt: t.txt, bucket: t.bucket, st: t.st, tipo: t.tipo,
               periodo: t.periodo || null, tags: t.tags.slice(), data: t.data || null };
    });
  }

  /* ------------------------------------------------------------- DOM ---- */

  var pilhas = {
    t: quadro.querySelector('[data-pilha="t"]'),
    b: quadro.querySelector('[data-pilha="b"]'),
    a: quadro.querySelector('[data-pilha="a"]')
  };

  var nos = Object.create(null);

  var SVGNS = "http://www.w3.org/2000/svg";

  function glifo(classe) {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", classe);
    svg.setAttribute("aria-hidden", "true");
    svg.appendChild(document.createElementNS(SVGNS, "use"));
    return svg;
  }

  function apontar(svg, id) {
    svg.firstChild.setAttribute("href", "#" + id);
  }

  // Mesma anatomia do cartao do app: glifo, descricao, icone de periodo e as
  // labels. Sem badge de status, porque quem conta o andamento e o glifo.
  function criarCartao(t) {
    var li = document.createElement("li");
    li.className = "cartao";
    li.dataset.id = t.id;

    li.appendChild(glifo("glifo glifo-c"));

    var txt = document.createElement("span");
    txt.className = "cartao-txt";
    txt.textContent = t.txt;
    li.appendChild(txt);

    if (t.periodo) {
      var per = glifo("periodo");
      apontar(per, "p-" + t.periodo);
      per.setAttribute("title", PERIODO[t.periodo]);
      li.appendChild(per);
    }

    li.appendChild(document.createElement("span")).className = "cartao-fim";

    return li;
  }

  function pintar(li, t) {
    li.classList.toggle("risca", t.st === "c" || t.st === "x");

    apontar(li.querySelector(".glifo-c"), "g-" + t.tipo + t.st);
    li.setAttribute("title", TIPO[t.tipo] + ", " + ROTULO[t.st].toLowerCase());

    var fim = li.querySelector(".cartao-fim");
    fim.textContent = "";

    if (t.data) {
      var flag = document.createElement("span");
      flag.className = "cartao-data";
      flag.textContent = t.data;
      fim.appendChild(flag);
    }

    t.tags.forEach(function (nome) {
      var tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = nome;
      fim.appendChild(tag);
    });
  }

  var ROTULO = T.rotulo;
  var TIPO = T.tipo;
  var PERIODO = T.periodo;

  function desenhar() {
    ["t", "b", "a"].forEach(function (bucket) {
      var doBucket = tarefas.filter(function (t) { return t.bucket === bucket; });

      doBucket.forEach(function (t) {
        var li = nos[t.id];
        if (!li) { li = nos[t.id] = criarCartao(t); }
        pintar(li, t);
        pilhas[bucket].appendChild(li);
      });

      var conta = document.querySelector('[data-conta="' + bucket + '"]');
      if (conta) conta.textContent = String(doBucket.length);
    });
  }

  /* -------------------------------------------------------------- FLIP -- */

  function todosOsCartoes() {
    return Array.prototype.slice.call(quadro.querySelectorAll(".cartao"));
  }

  function comAnimacao(mudar) {
    if (calmo) { mudar(); desenhar(); return; }

    var antes = new Map();
    todosOsCartoes().forEach(function (el) {
      antes.set(el.dataset.id, el.getBoundingClientRect());
    });

    mudar();
    desenhar();

    todosOsCartoes().forEach(function (el) {
      var f = antes.get(el.dataset.id);
      if (!f) return;

      var l = el.getBoundingClientRect();
      var dx = f.left - l.left;
      var dy = f.top - l.top;
      if (!dx && !dy) return;

      el.style.transition = "none";
      el.style.transform = "translate(" + dx + "px, " + dy + "px)";

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.style.transition = "";
          el.style.transform = "";
        });
      });
    });
  }

  /* ------------------------------------------------------- as 4 regras -- */

  // 1. Guarda concluídas e canceladas no histórico.
  function arquivarConcluidas() {
    return mover(function (t) {
      return t.bucket !== "a" && (t.st === "c" || t.st === "x");
    }, function (t) { t.bucket = "a"; });
  }

  // 2. Devolve à reserva o que sobrou do Hoje. O status `t` fica de fora de
  //    propósito: quem marcou "para amanhã" não está devendo nada.
  function devolverAReserva() {
    return mover(function (t) {
      return t.bucket === "t" && t.st !== "c" && t.st !== "x" && t.st !== "t";
    }, function (t) { t.bucket = "b"; t.st = "u"; });
  }

  // 3. Promove o que era "para amanhã", venha de onde vier.
  function promoverAmanha() {
    return mover(function (t) { return t.st === "t"; },
                 function (t) { t.bucket = "t"; t.st = "u"; });
  }

  // 4. Solta o que estava agendado para hoje, e limpa a data para a tarefa não
  //    ser promovida de novo na meia-noite seguinte.
  function soltarAgendadas() {
    return mover(function (t) { return t.data && t.bucket !== "a"; },
                 function (t) { t.bucket = "t"; t.data = null; });
  }

  function mover(casa, aplicar) {
    var alvos = tarefas.filter(casa);
    if (!alvos.length) return 0;
    comAnimacao(function () { alvos.forEach(aplicar); });
    // Só quem trocou de coluna ganha o realce. Marcar também quem apenas
    // deslizou para preencher o buraco deixaria a regra ilegível.
    alvos.forEach(function (t) { if (nos[t.id]) nos[t.id].classList.add("mexeu"); });
    return alvos.length;
  }

  /* ------------------------------------------------------------ roteiro -- */

  var relogio = document.querySelector(".relogio");
  var elHora = document.querySelector("[data-relogio]");
  var btnVirar = document.querySelector("[data-virar]");
  var btnVoltar = document.querySelector("[data-reiniciar]");
  var elNota = document.querySelector("[data-nota]");
  var regras = Array.prototype.slice.call(document.querySelectorAll("[data-regra]"));

  function espera(ms) {
    return new Promise(function (r) { setTimeout(r, calmo ? Math.min(ms, 80) : ms); });
  }

  function limparRealce() {
    regras.forEach(function (li) { li.classList.remove("acesa"); });
    todosOsCartoes().forEach(function (el) { el.classList.remove("mexeu"); });
    document.querySelectorAll(".regra-saldo").forEach(function (s) { s.textContent = ""; });
  }

  function acender(n, saldo) {
    var li = document.querySelector('[data-regra="' + n + '"]');
    if (!li) return;
    li.classList.add("acesa");
    var alvo = li.querySelector(".regra-saldo");
    if (alvo) alvo.textContent = saldo ? (saldo === 1 ? T.saldo.uma : saldo + T.saldo.varias) : T.saldo.nenhuma;
  }

  var PASSOS = [
    { n: 1, fn: arquivarConcluidas, nota: T.passos[0] },
    { n: 2, fn: devolverAReserva,   nota: T.passos[1] },
    { n: 3, fn: promoverAmanha,     nota: T.passos[2] },
    { n: 4, fn: soltarAgendadas,    nota: T.passos[3] }
  ];

  async function virar() {
    if (rodando) return;
    rodando = true;
    btnVirar.disabled = true;
    limparRealce();

    // o relógio cruzando a meia-noite
    var horas = ["23:59", "00:00"];
    for (var i = 0; i < horas.length; i++) {
      await espera(420);
      elHora.textContent = horas[i];
    }
    relogio.classList.add("virou");
    await espera(400);

    for (var p = 0; p < PASSOS.length; p++) {
      var passo = PASSOS[p];
      var saldo = passo.fn();
      acender(passo.n, saldo);
      if (elNota) elNota.textContent = passo.nota;
      await espera(1000);
    }

    if (elNota) {
      elNota.textContent = T.fim;
    }

    btnVoltar.hidden = false;
    rodando = false;
  }

  function voltar() {
    if (rodando) return;
    limparRealce();
    relogio.classList.remove("virou");
    elHora.textContent = "23:58";
    btnVirar.disabled = false;
    btnVoltar.hidden = true;
    if (elNota) {
      elNota.textContent = T.inicio;
    }
    comAnimacao(semear);
    todosOsCartoes().forEach(function (el) { el.classList.remove("mexeu"); });
  }

  btnVirar.addEventListener("click", virar);
  btnVoltar.addEventListener("click", voltar);

  semear();
  desenhar();

  /* ------------------------------------------------------- régua de estado -- */

  (function regua() {
    var caixa = document.querySelector(".regua-caixa");
    if (!caixa) return;

    var grande = caixa.querySelector("[data-glifo-grande]");
    var leitura = caixa.querySelector("[data-leitura]");
    var formas = Array.prototype.slice.call(caixa.querySelectorAll("[data-forma]"));
    var passos = Array.prototype.slice.call(caixa.querySelectorAll("[data-st]"));

    var forma = "o";
    var estado = "u";

    function pintarRegua() {
      grande.setAttribute("href", "#g-" + forma + estado);
      leitura.textContent = TIPO[forma] + ", " + ROTULO[estado].toLowerCase();

      formas.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.forma === forma));
      });

      // A régua sempre desenha os sete andamentos na forma escolhida: é o que
      // mostra que os dois eixos são o mesmo símbolo, e não dois campos.
      passos.forEach(function (b) {
        var st = b.dataset.st;
        b.querySelector("use").setAttribute("href", "#g-" + forma + st);
        b.setAttribute("aria-pressed", String(st === estado));
      });
    }

    formas.forEach(function (b) {
      b.addEventListener("click", function () { forma = b.dataset.forma; pintarRegua(); });
    });

    passos.forEach(function (b) {
      b.addEventListener("click", function () { estado = b.dataset.st; pintarRegua(); });
    });

    pintarRegua();
  })();
})();
