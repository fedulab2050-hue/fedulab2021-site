// 프로그램 찾기: 교육 대상 → 교육 트랙 → 주제 순서로 좁힙니다.
// (전체 목록은 HTML에 이미 있고, 여기서는 보이기·숨기기만 합니다)
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.prog'));
  var sA = document.getElementById('f-aud'), sT = document.getElementById('f-track'), sM = document.getElementById('f-mid');
  var reset = document.getElementById('f-reset'), count = document.getElementById('f-count'), path = document.getElementById('f-path');
  var empty = document.getElementById('f-empty');
  if (!sT || !sA || !items.length) return;

  // 트랙 이름(처음 HTML에 있던 순서 그대로)
  var trackNames = Array.prototype.slice.call(sT.options).filter(function (o) { return o.value; }).map(function (o) { return [o.value, o.text]; });

  function uniq(arr) { var o = []; arr.forEach(function (v) { if (o.indexOf(v) < 0) o.push(v); }); return o; }
  function hasAud(el, a) { return !a || (el.dataset.aud || '').split('|').indexOf(a) >= 0; }
  function fillTracks(a) {
    var keep = sT.value;
    var ok = uniq(items.filter(function (el) { return hasAud(el, a); }).map(function (el) { return el.dataset.track; }));
    sT.innerHTML = '';
    var all = document.createElement('option'); all.value = ''; all.textContent = '트랙 전체'; sT.appendChild(all);
    trackNames.forEach(function (t) { if (ok.indexOf(t[0]) >= 0) { var o = document.createElement('option'); o.value = t[0]; o.textContent = t[1]; sT.appendChild(o); } });
    sT.value = ok.indexOf(keep) >= 0 ? keep : '';
  }
  function fillMids(a, t) {
    var keep = sM.value;
    var mids = t ? uniq(items.filter(function (el) { return el.dataset.track === t && hasAud(el, a); }).map(function (el) { return el.dataset.mid; })) : [];
    sM.innerHTML = '';
    var all = document.createElement('option'); all.value = ''; all.textContent = '주제 전체'; sM.appendChild(all);
    mids.forEach(function (v) { var o = document.createElement('option'); o.value = v; o.textContent = v; sM.appendChild(o); });
    sM.disabled = mids.length === 0;
    sM.value = mids.indexOf(keep) >= 0 ? keep : '';
  }

  function apply(push) {
    var a = sA.value, t = sT.value, m = sM.value, n = 0;
    items.forEach(function (el) {
      var ok = hasAud(el, a) && (!t || el.dataset.track === t) && (!m || el.dataset.mid === m);
      el.hidden = !ok; if (ok) n++;
    });
    count.textContent = n;
    var names = [a ? a : '전체 대상', t ? sT.options[sT.selectedIndex].text : '전체 트랙'];
    if (m) names.push(m);
    path.textContent = names.join(' › ');
    empty.hidden = n !== 0;
    reset.disabled = !a && !t;
    if (push) {
      var q = new URLSearchParams();
      if (a) q.set('aud', a); if (t) q.set('track', t); if (m) q.set('mid', m);
      history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q.toString() : ''));
    }
  }

  sA.addEventListener('change', function () { fillTracks(sA.value); fillMids(sA.value, sT.value); apply(true); });
  sT.addEventListener('change', function () { sM.value = ''; fillMids(sA.value, sT.value); apply(true); });
  sM.addEventListener('change', function () { apply(true); });
  reset.addEventListener('click', function () {
    sA.value = ''; sT.value = ''; sM.value = ''; fillTracks(''); fillMids('', ''); apply(true); sA.focus();
  });

  // URL 상태 복원 (트랙 페이지의 '프로그램 보기' 링크는 ?track= 으로 들어옵니다)
  var q = new URLSearchParams(location.search);
  var qa = q.get('aud');
  if (qa && Array.prototype.some.call(sA.options, function (o) { return o.value === qa; })) sA.value = qa;
  fillTracks(sA.value);
  var qt = q.get('track');
  if (qt && Array.prototype.some.call(sT.options, function (o) { return o.value === qt; })) sT.value = qt;
  fillMids(sA.value, sT.value);
  var qm = q.get('mid');
  if (qm && Array.prototype.some.call(sM.options, function (o) { return o.value === qm; })) sM.value = qm;
  apply(false);
})();
