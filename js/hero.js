// 히어로 네트워크 구(球) 모션 그래픽
// - 점과 선으로 이어진 구가 천천히 회전하고, 선을 따라 작은 빛이 이동합니다.
// - 화면 밖이거나 탭이 숨겨지면 멈추고, '동작 줄이기' 설정이면 정지 화면만 그립니다.
(function () {
  var canvas = document.querySelector('.hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 결정적 난수(매번 같은 모양)
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var N = 190, pts = [], edges = [], adj = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var r = Math.sqrt(1 - y * y);
    var th = golden * i + (rnd() - 0.5) * 0.5;
    var jy = y + (rnd() - 0.5) * 0.06;
    pts.push({
      x: Math.cos(th) * r, y: jy, z: Math.sin(th) * r,
      size: 0.8 + rnd() * 1.6,
      glow: rnd() < 0.09,
      ph: rnd() * Math.PI * 2, sp: 0.4 + rnd() * 0.8
    });
    adj.push([]);
  }
  // 가까운 이웃 3~4개와 연결 (고정된 망 구조)
  var seen = {};
  for (var a = 0; a < N; a++) {
    var d = [];
    for (var b = 0; b < N; b++) {
      if (a === b) continue;
      var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
      d.push([dx * dx + dy * dy + dz * dz, b]);
    }
    d.sort(function (p, q) { return p[0] - q[0]; });
    var k = 3 + (rnd() < 0.4 ? 1 : 0);
    for (var j = 0; j < k; j++) {
      var bb = d[j][1], key = a < bb ? a + '-' + bb : bb + '-' + a;
      if (!seen[key]) { seen[key] = 1; edges.push([a, bb]); adj[a].push(bb); adj[bb].push(a); }
    }
  }
  // 선을 따라 이동하는 빛
  var pulses = [];
  for (var p = 0; p < 9; p++) {
    var s = Math.floor(rnd() * N);
    pulses.push({ from: s, to: adj[s][0], t: rnd(), v: 0.00035 + rnd() * 0.00035 });
  }
  // 떠다니는 입자와 + 표시
  var dust = [];
  for (var q = 0; q < 34; q++) dust.push({ x: rnd(), y: rnd(), r: 0.8 + rnd() * 2.2, v: 0.004 + rnd() * 0.01, a: 0.35 + rnd() * 0.55 });
  var plus = [[0.07, 0.12], [0.37, 0.47], [0.6, 0.71], [0.55, 0.92], [0.27, 0.02], [0.93, 0.62]];

  var W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0, alphaAll = 1;
  var proj = new Array(N);

  function layout() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (W < 720) { cx = W * 0.88; cy = H * 0.17; R = Math.min(W * 0.5, 240); alphaAll = 0.55; }
    else if (W < 1080) { cx = W * 0.8; cy = H * 0.34; R = Math.min(H * 0.34, W * 0.3); alphaAll = 0.8; }
    else { cx = W * 0.765; cy = H * 0.43; R = Math.min(H * 0.4, W * 0.235); alphaAll = 1; }
  }

  var rotY = 0.6, tilt = 0.32, last = 0, t = 0;
  function frame(now) {
    var dt = last ? Math.min(now - last, 50) : 16; last = now; t += dt;
    if (!reduce) rotY += dt * 0.000055;
    draw(dt);
    if (running) raf = requestAnimationFrame(frame);
  }

  function draw(dt) {
    ctx.clearRect(0, 0, W, H);
    var cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(tilt), sX = Math.sin(tilt);
    var f = 2.8;
    for (var i = 0; i < N; i++) {
      var P = pts[i];
      var wob = reduce ? 1 : 1 + 0.03 * Math.sin(t * 0.0006 * P.sp + P.ph);
      var x = P.x * wob, y = P.y * wob, z = P.z * wob;
      var x1 = x * cY + z * sY, z1 = -x * sY + z * cY;
      var y2 = y * cX - z1 * sX, z2 = y * sX + z1 * cX;
      var sc = f / (f - z2);
      proj[i] = { x: cx + x1 * R * sc, y: cy + y2 * R * sc, z: z2, s: sc };
    }
    // 선
    for (var e = 0; e < edges.length; e++) {
      var A = proj[edges[e][0]], B = proj[edges[e][1]];
      var depth = ((A.z + B.z) / 2 + 1) / 2; // 0(뒤) ~ 1(앞)
      ctx.lineWidth = depth > 0.5 ? 1.1 : 0.8;
      if (depth > 0.5) ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(0.32 + depth * 0.6, 0.92) * alphaAll + ')';
      else ctx.strokeStyle = 'rgba(96,134,200,' + (0.14 + depth * 0.36) * alphaAll + ')';
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }
    // 점
    for (var n = 0; n < N; n++) {
      var Q = proj[n], P2 = pts[n], dep = (Q.z + 1) / 2;
      var rr = P2.size * Q.s * (P2.glow ? 1.6 : 1);
      if (P2.glow && dep > 0.45) {
        var g = ctx.createRadialGradient(Q.x, Q.y, 0, Q.x, Q.y, rr * 6);
        g.addColorStop(0, 'rgba(255,255,255,' + 0.75 * alphaAll + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(Q.x, Q.y, rr * 6, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,' + alphaAll + ')';
      } else {
        ctx.fillStyle = dep > 0.5 ? 'rgba(92,134,206,' + (0.45 + dep * 0.45) * alphaAll + ')' : 'rgba(120,156,214,' + (0.18 + dep * 0.4) * alphaAll + ')';
      }
      ctx.beginPath(); ctx.arc(Q.x, Q.y, rr, 0, 6.283); ctx.fill();
    }
    // 선을 따라 흐르는 빛
    if (!reduce) {
      for (var k = 0; k < pulses.length; k++) {
        var pu = pulses[k];
        pu.t += dt * pu.v * 3;
        if (pu.t >= 1) {
          var nb = adj[pu.to], next = nb[Math.floor(rnd() * nb.length)];
          if (next === pu.from && nb.length > 1) next = nb[(nb.indexOf(next) + 1) % nb.length];
          pu.from = pu.to; pu.to = next; pu.t = 0;
        }
        var S = proj[pu.from], E = proj[pu.to];
        var dd = ((S.z + E.z) / 2 + 1) / 2;
        if (dd < 0.45) continue;
        var px = S.x + (E.x - S.x) * pu.t, py = S.y + (E.y - S.y) * pu.t;
        var gg = ctx.createRadialGradient(px, py, 0, px, py, 7);
        gg.addColorStop(0, 'rgba(255,255,255,' + 0.95 * alphaAll + ')');
        gg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(px, py, 7, 0, 6.283); ctx.fill();
      }
    }
    // 입자
    for (var m = 0; m < dust.length; m++) {
      var D = dust[m];
      if (!reduce) { D.y -= D.v * dt * 0.001; if (D.y < -0.02) { D.y = 1.02; D.x = rnd(); } }
      ctx.fillStyle = 'rgba(255,255,255,' + D.a + ')';
      ctx.beginPath(); ctx.arc(D.x * W, D.y * H, D.r, 0, 6.283); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(70,104,170,.45)'; ctx.lineWidth = 1;
    for (var u = 0; u < plus.length; u++) {
      var X = plus[u][0] * W, Y = plus[u][1] * H;
      ctx.beginPath(); ctx.moveTo(X - 7, Y); ctx.lineTo(X + 7, Y); ctx.moveTo(X, Y - 7); ctx.lineTo(X, Y + 7); ctx.stroke();
    }
  }

  var running = false, raf = 0, visible = true;
  function start() { if (running || reduce || !visible || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  layout(); draw(16);
  if ('ResizeObserver' in window) new ResizeObserver(function () { layout(); if (!running) draw(0); }).observe(canvas);
  else window.addEventListener('resize', function () { layout(); if (!running) draw(0); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  start();
})();
