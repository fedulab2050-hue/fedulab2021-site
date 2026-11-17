// 프로그램 찾기: 교육 트랙 → 주제, 그리고 따로 고르는 교육 대상
// (전체 목록은 HTML에 이미 있고, 여기서는 보이기·숨기기만 합니다)
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.prog'));
  var s1 = document.getElementById('f-track'), s2 = document.getElementById('f-mid'), s3 = document.getElementById('f-aud');
  var reset = document.getElementById('f-reset'), count = document.getElementById('f-count'), path = document.getElementById('f-path');
  var empty = document.getElementById('f-empty');
  if (!s1 || !items.length) return;

  function uniq(arr) { var o = []; arr.forEach(function (v) { if (o.indexOf(v) < 0) o.push(v); }); return o; }
  function fill(sel, values, label) {
    sel.innerHTML = '';
    var all = document.createElement('option'); all.value = ''; all.textContent = label; sel.appendChild(all);
    values.forEach(function (v) { var o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); });
    sel.disabled = values.length === 0;
  }
  function midsFor(track) { return uniq(items.filter(function (el) { return el.dataset.track === track; }).map(function (el) { return el.dataset.mid; })); }
  function hasAud(el, a) { return (el.dataset.aud || '').split('|').indexOf(a) >= 0; }

  function apply(push) {
    var t = s1.value, m = s2.value, a = s3.value, n = 0;
    items.forEach(function (el) {
      var ok = (!t || el.dataset.track === t) && (!m || el.dataset.mid === m) && (!a || hasAud(el, a));
      el.hidden = !ok; if (ok) n++;
    });
    count.textContent = n;
    var names = [t ? s1.options[s1.selectedIndex].text : '전체 트랙'];
    if (m) names.push(m);
    path.textContent = names.join(' › ') + (a ? ' · 대상: ' + a : '');
    empty.hidden = n !== 0;
    reset.disabled = !t && !a;
    if (push) {
      var q = new URLSearchParams();
      if (t) q.set('track', t); if (m) q.set('mid', m); if (a) q.set('aud', a);
      var url = location.pathname + (q.toString() ? '?' + q.toString() : '');
      history.replaceState(null, '', url);
    }
  }

  s1.addEventListener('change', function () {
    fill(s2, s1.value ? midsFor(s1.value) : [], '주제 전체');
    apply(true);
  });
  s2.addEventListener('change', function () { apply(true); });
  s3.addEventListener('change', function () { apply(true); });
  reset.addEventListener('click', function () {
    s1.value = ''; s3.value = ''; fill(s2, [], '주제 전체'); apply(true); s1.focus();
  });

  // URL 상태 복원
  var q = new URLSearchParams(location.search);
  fill(s2, [], '주제 전체');
  var qt = q.get('track');
  if (qt && Array.prototype.some.call(s1.options, function (o) { return o.value === qt; })) {
    s1.value = qt; fill(s2, midsFor(qt), '주제 전체');
    var qm = q.get('mid');
    if (qm && midsFor(qt).indexOf(qm) >= 0) s2.value = qm;
  }
  var qa = q.get('aud');
  if (qa && Array.prototype.some.call(s3.options, function (o) { return o.value === qa; })) s3.value = qa;
  apply(false);
})();
