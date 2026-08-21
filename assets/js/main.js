/* Easy Home Planejados */
(function () {
  'use strict';

  var WA = '5511916158115';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ano ---------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- header encolhe ao rolar ---------- */
  var hd = document.querySelector('.hd');
  if (hd && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (e) {
      hd.classList.toggle('is-stuck', !e[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ---------- reveal ---------- */
  var revs = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revs, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -40px 0px' });
    Array.prototype.forEach.call(revs, function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- FAQ ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.fq-q'), function (btn) {
    var box = btn.parentElement;
    if (btn.getAttribute('aria-expanded') === 'true') box.classList.add('is-open');
    btn.addEventListener('click', function () {
      var open = box.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- carrossel de projetos ---------- */
  /* fita contínua: duplica os cards uma vez para o loop fechar sem salto */
  var track = document.getElementById('projTrack');
  if (track && !reduce) {
    var originais = Array.prototype.slice.call(track.children);
    originais.forEach(function (fig) {
      var c = fig.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(c.querySelectorAll('img'), function (im) { im.setAttribute('alt', ''); });
      track.appendChild(c);
    });
  }

  /* ---------- simulador ---------- */
  var form = document.getElementById('simForm');
  if (!form) return;

  var card = document.getElementById('simCard');
  var bar = document.getElementById('simBar');
  var now = document.getElementById('simNow');
  var back = document.getElementById('simBack');
  var nextBtn = document.getElementById('simNext');
  var nextTx = document.getElementById('simNextTx');
  var stepsUi = document.querySelectorAll('#simSteps li');
  var qs = form.querySelectorAll('.sim-q');
  var TOTAL = 6;
  var step = 1;
  var answers = { 1: '', 2: '', 3: '', 4: '', 5: '' };
  var LABELS = { 1: 'Ambiente', 2: 'Prazo', 3: 'Investimento', 4: 'Imóvel', 5: 'Medidas' };

  function paint() {
    Array.prototype.forEach.call(qs, function (q) {
      q.classList.toggle('is-on', Number(q.dataset.q) === step);
    });
    var pct = Math.round((step / TOTAL) * 100);
    if (bar) bar.style.width = pct + '%';
    if (now) now.textContent = Math.min(step, 5);
    if (back) back.hidden = step === 1;
    if (nextTx) nextTx.textContent = step === TOTAL ? 'Ver minha proposta' : 'Continuar';
    if (nextBtn) nextBtn.classList.toggle('is-wa', step === TOTAL);
    Array.prototype.forEach.call(stepsUi, function (li) {
      var n = Number(li.dataset.step);
      li.classList.toggle('is-on', n === step);
      li.classList.toggle('is-done', n < step);
    });
  }

  /* hooks de tracking: só disparam se o Pixel ou o GA4 estiverem instalados */
  function track(evt, data) {
    if (typeof window.fbq === 'function') window.fbq('trackCustom', evt, data || {});
    if (typeof window.gtag === 'function') window.gtag('event', evt, data || {});
  }

  function go(n) {
    var antes = step;
    step = Math.max(1, Math.min(TOTAL, n));
    paint();
    if (step > antes) track('SimuladorPasso' + step);
  }

  function warn(q, msg) {
    var el = q.querySelector('.err-opt');
    if (!el) {
      el = document.createElement('p');
      el.className = 'err err-opt';
      el.setAttribute('role', 'alert');
      el.style.marginTop = '12px';
      q.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
  }
  function clearWarn(q) {
    var el = q.querySelector('.err-opt');
    if (el) el.hidden = true;
  }

  /* seleção de chip */
  Array.prototype.forEach.call(qs, function (q) {
    var n = Number(q.dataset.q);
    if (n > 5) return;
    q.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      Array.prototype.forEach.call(q.querySelectorAll('.chip'), function (c) { c.classList.remove('is-sel'); });
      chip.classList.add('is-sel');
      answers[n] = chip.dataset.v;
      clearWarn(q);
      if (reduce) { go(n + 1); }
      else { setTimeout(function () { if (step === n) go(n + 1); }, 240); }
    });
  });

  if (back) back.addEventListener('click', function () { go(step - 1); });

  function fieldErr(input, errEl, bad) {
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    errEl.hidden = !bad;
    return !bad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (step < TOTAL) {
      if (!answers[step]) {
        warn(qs[step - 1], 'Escolha uma opção pra continuar.');
        return;
      }
      go(step + 1);
      return;
    }

    var nome = document.getElementById('nome');
    var cidade = document.getElementById('cidade');
    var lgpd = document.getElementById('lgpd');
    var ok = true;

    ok = fieldErr(nome, document.getElementById('errNome'), nome.value.trim().length < 2) && ok;
    ok = fieldErr(cidade, document.getElementById('errCidade'), cidade.value.trim().length < 2) && ok;
    var errL = document.getElementById('errLgpd');
    errL.hidden = lgpd.checked;
    if (!lgpd.checked) ok = false;
    if (!ok) return;

    var linhas = ['Olá! Fiz a simulação no site da Easy Home.'];
    for (var i = 1; i <= 5; i++) linhas.push(LABELS[i] + ': ' + answers[i]);
    linhas.push('Meu nome é ' + nome.value.trim() + ', sou de ' + cidade.value.trim() + '.');

    var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(linhas.join('\n'));

    if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: answers[1] });
    if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { ambiente: answers[1], faixa: answers[3] });

    if (bar) bar.style.width = '100%';
    Array.prototype.forEach.call(stepsUi, function (li) { li.classList.remove('is-on'); li.classList.add('is-done'); });

    /* vai direto pro WhatsApp. Se o navegador barrar a aba nova, navega na própria */
    var aba = window.open(url, '_blank');
    if (!aba || aba.closed || typeof aba.closed === 'undefined') window.location.href = url;
  });

  /* abrir simulador a partir de qualquer CTA */
  function openSim(amb, faixa) {
    if (amb) {
      var q1 = form.querySelector('[data-q="1"]');
      var c1 = q1.querySelector('.chip[data-v="' + amb + '"]');
      if (c1) {
        Array.prototype.forEach.call(q1.querySelectorAll('.chip'), function (c) { c.classList.remove('is-sel'); });
        c1.classList.add('is-sel');
        answers[1] = amb;
      }
    }
    if (faixa) {
      var q3 = form.querySelector('[data-q="3"]');
      var c3 = q3.querySelector('.chip[data-v="' + faixa + '"]');
      if (c3) {
        Array.prototype.forEach.call(q3.querySelectorAll('.chip'), function (c) { c.classList.remove('is-sel'); });
        c3.classList.add('is-sel');
        answers[3] = faixa;
      }
    }
    go(amb ? 2 : 1);
    document.getElementById('simulador').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-sim-open]'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openSim(el.dataset.amb || '', el.dataset.faixa || '');
      if (nav) nav.classList.remove('is-open');
      if (burger) burger.setAttribute('aria-expanded', 'false');
    });
  });

  paint();
})();
