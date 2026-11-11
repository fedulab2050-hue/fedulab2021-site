// 상담문의: 입력 내용을 정리해 메일 앱으로 넘기거나 복사합니다. (홈페이지 서버에는 저장하지 않습니다)
(function () {
  var form = document.getElementById('inquiry');
  if (!form) return;
  var TO = form.dataset.to;
  var status = document.getElementById('form-status');
  var copyBtn = document.getElementById('copy-btn');

  // 프로그램 찾기·트랙 페이지에서 넘어온 값 채우기
  var q = new URLSearchParams(location.search);
  if (q.get('track')) { var sel = form.elements.track; Array.prototype.forEach.call(sel.options, function (o) { if (o.dataset.id === q.get('track')) sel.value = o.value; }); }
  if (q.get('program')) {
    var opt = document.querySelector('#program-list option[data-program-id="' + q.get('program').replace(/[^a-z0-9-]/gi, '') + '"]');
    if (opt) {
      form.elements.program.value = opt.value;
      var tsel = form.elements.track;
      Array.prototype.forEach.call(tsel.options, function (o) { if (o.dataset.id === opt.dataset.track) tsel.value = o.value; });
    }
  }

  var labels = { org: '기관명', name: '담당자명', reply: '회신 연락처', dept: '부서·직책', track: '관심 교육 트랙', program: '관심 프로그램', target: '참여 대상·예상 인원', schedule: '희망 일정·회차', place: '장소', budget: '예산 범위', support: '필요한 지원', message: '문의 내용' };

  function compose() {
    var lines = [];
    Object.keys(labels).forEach(function (k) {
      var el = form.elements[k]; if (!el) return;
      var v;
      if (k === 'support') v = Array.prototype.filter.call(form.querySelectorAll('input[name="support"]'), function (c) { return c.checked; }).map(function (c) { return c.value; }).join(', ');
      else v = (el.value || '').trim();
      lines.push('■ ' + labels[k] + ': ' + (v || '미정'));
    });
    return lines.join('\n');
  }
  function subject() { return '[홈페이지 상담문의] ' + (form.elements.org.value.trim() || '기관명 미입력') + ' / ' + (form.elements.track.value || '트랙 미정'); }

  function validate() {
    var ok = true, first = null;
    ['org', 'name', 'reply'].forEach(function (k) {
      var el = form.elements[k], err = document.getElementById('err-' + k), bad = !el.value.trim();
      el.setAttribute('aria-invalid', bad ? 'true' : 'false'); err.hidden = !bad;
      if (bad) { ok = false; if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) { status.textContent = '필수 항목(기관명, 담당자명, 회신 연락처)을 입력해 주세요.'; return; }
    var href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject()) + '&body=' + encodeURIComponent(compose() + '\n\n(미래교육연구원 홈페이지 상담문의 양식에서 작성)');
    window.location.href = href;
    status.textContent = '메일 앱을 열었습니다. 메일 앱에서 [보내기]를 눌러야 접수됩니다. 메일 앱이 열리지 않으면 [내용 복사하기]를 눌러 ' + TO + '으로 보내 주세요.';
  });

  if (copyBtn) copyBtn.addEventListener('click', function () {
    if (!validate()) { status.textContent = '필수 항목(기관명, 담당자명, 회신 연락처)을 입력해 주세요.'; return; }
    var text = subject() + '\n\n' + compose();
    function done() { status.textContent = '문의 내용을 복사했습니다. 사용하시는 메일에 붙여 넣어 ' + TO + '으로 보내 주세요.'; }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (err) { status.textContent = '복사하지 못했습니다. 전화(0507-1333-5559)나 이메일로 문의해 주세요.'; }
      document.body.removeChild(ta);
    }
  });
})();
