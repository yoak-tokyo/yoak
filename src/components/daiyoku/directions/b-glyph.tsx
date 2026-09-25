"use client";

import { useEffect, useRef } from "react";

// 「欲」の一文字を、45° のハーフトーンの網点で組み立てる canvas。
// 点はそれぞれ「家（字の上の位置）」をもち、ばねで家へ戻ろうとする。
// カーソルに押されて散り、離れるとまた集まる。

const ACID = "#d2ff1f";
const WHITE = "#f4f4f2";
const GRAY = "#5c5c5c";
const DIM = "#383838";

export type GlyphTick = {
  /** カーソルの位置（canvas 内の 0〜1）。カーソルが外にあれば null */
  pointer: { x: number; y: number } | null;
  /** 読み進めた割合（mark のみ） */
  fill: number;
};

type Props = {
  variant: "kv" | "mark";
  className?: string;
  /** 散らばり具合 0〜1（スクロールに連動させる） */
  getScatter?: () => number;
  /** 網点を白く満たす割合 0〜1（mark のみ） */
  getFill?: () => number;
  /** 点の数が決まったら呼ぶ */
  onBuild?: (count: number) => void;
  /** 毎フレーム呼ぶ（DOM の読み出し表示の更新用。state は更新しないこと） */
  onTick?: (t: GlyphTick) => void;
};

// シード付きの擬似乱数（mulberry32）
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Field = {
  n: number;
  hx: Float32Array;
  hy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  r0: Float32Array;
  sx: Float32Array;
  sy: Float32Array;
  delay: Float32Array;
  // 字の中での縦位置 0〜1（mark の塗りに使う）
  v: Float32Array;
  bucket: Uint8Array;
  gap: number;
  box: { x: number; y: number; size: number };
};

// 字をオフスクリーンに描き、45° に傾けた格子で濃さをサンプリングする
function sampleGlyph(
  w: number,
  h: number,
  box: { cx: number; cy: number; size: number },
  gap: number,
  family: string,
  seed: number,
  scatterScale: number,
): Field {
  const off = document.createElement("canvas");
  off.width = Math.ceil(w);
  off.height = Math.ceil(h);
  const c = off.getContext("2d", { willReadFrequently: true })!;
  c.fillStyle = "#fff";
  c.textBaseline = "alphabetic";
  c.textAlign = "left";

  // 字の外接矩形が box.size に収まるように文字サイズを合わせる
  let fs = box.size;
  c.font = `900 ${fs}px ${family}`;
  let m = c.measureText("欲");
  const mw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const mh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const s = box.size / Math.max(mw || fs, mh || fs);
  fs *= s;
  c.font = `900 ${fs}px ${family}`;
  m = c.measureText("欲");
  const gw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
  const gh = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const left = box.cx - gw / 2;
  const top = box.cy - gh / 2;
  c.fillText("欲", left + m.actualBoundingBoxLeft, top + m.actualBoundingBoxAscent);

  const data = c.getImageData(0, 0, off.width, off.height).data;
  const alpha = (px: number, py: number) => {
    const ix = px | 0;
    const iy = py | 0;
    if (ix < 0 || iy < 0 || ix >= off.width || iy >= off.height) return 0;
    return data[(iy * off.width + ix) * 4 + 3] / 255;
  };

  const hx: number[] = [];
  const hy: number[] = [];
  const r0: number[] = [];
  const vv: number[] = [];
  const cos = Math.SQRT1_2;
  const sin = Math.SQRT1_2;
  const half = (Math.max(gw, gh) * Math.SQRT2) / 2 + gap;
  const steps = Math.ceil(half / gap);
  const q = gap * 0.28;
  const maxR = gap * 0.47;
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      const u = i * gap;
      const t = j * gap;
      const px = box.cx + u * cos - t * sin;
      const py = box.cy + u * sin + t * cos;
      if (px < left - gap || px > left + gw + gap || py < top - gap || py > top + gh + gap) continue;
      // 5 点の平均で縁をなめらかにする
      const cov =
        (alpha(px, py) * 2 +
          alpha(px - q, py) +
          alpha(px + q, py) +
          alpha(px, py - q) +
          alpha(px, py + q)) /
        6;
      if (cov < 0.08) continue;
      hx.push(px);
      hy.push(py);
      r0.push(maxR * Math.sqrt(cov));
      vv.push((py - top) / gh);
    }
  }

  const n = hx.length;
  const rand = rng(seed);
  const f: Field = {
    n,
    hx: Float32Array.from(hx),
    hy: Float32Array.from(hy),
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    r0: Float32Array.from(r0),
    sx: new Float32Array(n),
    sy: new Float32Array(n),
    delay: new Float32Array(n),
    v: Float32Array.from(vv),
    bucket: new Uint8Array(n),
    gap,
    box: { x: left, y: top, size: Math.max(gw, gh) },
  };
  for (let k = 0; k < n; k++) {
    // 散るときは字の中心から外へはじけ、少しだけ向きを乱す
    const dx = f.hx[k] - box.cx;
    const dy = f.hy[k] - box.cy;
    const a = Math.atan2(dy, dx) + (rand() - 0.5) * 1.4;
    const mag = (0.25 + rand() * 0.75) * scatterScale;
    f.sx[k] = Math.cos(a) * mag;
    f.sy[k] = Math.sin(a) * mag;
    // 登場は左から右へ流れるように、少しずつずらして集まる
    f.delay[k] = 0.15 + (f.hx[k] / w) * 0.75 + rand() * 0.45;
    // 最初は画面全体にばらまいておく
    f.x[k] = rand() * w;
    f.y[k] = rand() * h;
  }
  return f;
}

export function GlyphCanvas({ variant, className, getScatter, getFill, onBuild, onTick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 最新のコールバックを描画ループから参照する
  const cb = useRef({ getScatter, getFill, onBuild, onTick });
  useEffect(() => {
    cb.current = { getScatter, getFill, onBuild, onTick };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isKv = variant === "kv";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let disposed = false;
    let raf = 0;
    let visible = false;
    let field: Field | null = null;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let family = "sans-serif";
    let hudFont = "10px sans-serif";
    let built = false;
    let introStart = 0;
    let last = 0;

    // カーソル（ビューポート座標）。タッチでは使わない
    const pointer = { cx: 0, cy: 0, on: false };
    // なめらかに追いかける位置（canvas 座標）
    const lens = { x: -9999, y: -9999, a: 0 };
    // クリック・タップの衝撃波
    const waves: { x: number; y: number; t: number }[] = [];

    const radius = () => (isKv ? Math.max(90, Math.min(w, h) * 0.17) : Math.max(48, w * 0.2));

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w < 2 || h < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      const mobile = w < 768;
      let box: { cx: number; cy: number; size: number };
      let gap: number;
      if (isKv) {
        box = mobile
          ? { cx: w / 2, cy: h * 0.4, size: Math.min(w * 0.9, h * 0.56) }
          : { cx: w * 0.65, cy: h * 0.48, size: Math.min(h * 0.84, w * 0.58) };
        // 大きさに合わせて網点の間隔を決め、点の数をおさえる
        gap = Math.max(mobile ? 5 : 6, box.size / (mobile ? 64 : 112));
      } else {
        box = { cx: w / 2, cy: h / 2, size: w * 0.64 };
        gap = Math.max(3.4, box.size / 58);
      }
      const prev = field;
      field = sampleGlyph(
        w,
        h,
        box,
        gap,
        family,
        isKv ? 20260925 : 0x6b32,
        isKv ? Math.max(w, h) * 0.9 : w * 0.55,
      );
      // 2 回目以降（リサイズ）は登場をやり直さず、その場で組み直す
      if (prev || reduced) {
        field.x.set(field.hx);
        field.y.set(field.hy);
        field.delay.fill(0);
      } else if (!isKv) {
        // mark は散った状態から始め、スクロールで集まる
        for (let i = 0; i < field.n; i++) {
          field.x[i] = field.hx[i] + field.sx[i];
          field.y[i] = field.hy[i] + field.sy[i];
        }
        field.delay.fill(0);
      }
      if (!built) introStart = performance.now();
      built = true;
      cb.current.onBuild?.(field.n);
      draw(performance.now(), 0);
    };

    const draw = (now: number, dtf: number) => {
      const f = field;
      if (!f) return;
      const t = (now - introStart) / 1000;
      const scatter = reduced ? 0 : Math.max(0, Math.min(1, cb.current.getScatter?.() ?? 0));
      const fill = reduced ? 1 : Math.max(0, Math.min(1, cb.current.getFill?.() ?? 1));
      const R = radius();
      const R2 = R * R;
      const rect = canvas.getBoundingClientRect();

      // カーソル：マウスは実際の位置、タッチでは何もしない
      let target: { x: number; y: number } | null = null;
      if (pointer.on) {
        const px = pointer.cx - rect.left;
        const py = pointer.cy - rect.top;
        if (px >= 0 && py >= 0 && px <= w && py <= h) target = { x: px, y: py };
      }
      const k = dtf > 0 ? 1 - Math.pow(1 - 0.22, dtf) : 1;
      if (target) {
        if (lens.a < 0.01) {
          lens.x = target.x;
          lens.y = target.y;
        }
        lens.x += (target.x - lens.x) * k;
        lens.y += (target.y - lens.y) * k;
        lens.a += (1 - lens.a) * k;
      } else {
        lens.a += (0 - lens.a) * k;
      }
      const lensOn = lens.a > 0.02 && !reduced;

      // 物理：ばねで家へ戻り、カーソルからは押しのけられる
      const stiff = isKv ? 0.028 : 0.05;
      const damp = Math.pow(0.84, dtf);
      const scatterAmt = Math.pow(scatter, 1.25);
      const time = now / 1000;
      // タッチ端末では、字全体がゆっくり呼吸するように揺らぐ
      const sway = finePointer ? 0.6 : 1.6;
      const acidR2 = (R * 0.78) ** 2;
      const g = f.gap;

      for (let i = 0; i < f.n; i++) {
        let tx = f.hx[i] + f.sx[i] * scatterAmt;
        let ty = f.hy[i] + f.sy[i] * scatterAmt;
        if (!reduced) {
          const ph = f.hx[i] * 0.013 + f.hy[i] * 0.009;
          tx += Math.sin(time * 0.9 + ph) * sway;
          ty += Math.cos(time * 0.7 + ph * 1.3) * sway;
        }
        if (reduced) {
          f.x[i] = tx;
          f.y[i] = ty;
        } else if (dtf > 0) {
          let ax = 0;
          let ay = 0;
          if (t >= f.delay[i]) {
            ax = (tx - f.x[i]) * stiff;
            ay = (ty - f.y[i]) * stiff;
          }
          if (lensOn) {
            const dx = f.x[i] - lens.x;
            const dy = f.y[i] - lens.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const p = 1 - d / R;
              const force = p * p * 2.4 * lens.a;
              ax += (dx / d) * force;
              ay += (dy / d) * force;
            }
          }
          for (let wv = 0; wv < waves.length; wv++) {
            const W = waves[wv];
            const age = (now - W.t) / 1000;
            if (age > 0.12) continue;
            const dx = f.x[i] - W.x;
            const dy = f.y[i] - W.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const reach = R * 3.2;
            if (d < reach) {
              const force = (1 - d / reach) * 9;
              ax += (dx / d) * force;
              ay += (dy / d) * force;
            }
          }
          f.vx[i] = (f.vx[i] + ax * dtf) * damp;
          f.vy[i] = (f.vy[i] + ay * dtf) * damp;
          f.x[i] += f.vx[i] * dtf;
          f.y[i] += f.vy[i] * dtf;
        }

        // 色分け：0 白 / 1 グレー（家から離れた点）/ 2 蛍光（カーソルの近く）/ 3 暗（まだ読んでいない）
        const ox = f.x[i] - f.hx[i];
        const oy = f.y[i] - f.hy[i];
        const far = ox * ox + oy * oy > (g * 2.2) ** 2;
        let b = far ? 1 : 0;
        if (!isKv && f.v[i] > fill) b = 3;
        if (lensOn) {
          const dx = f.x[i] - lens.x;
          const dy = f.y[i] - lens.y;
          if (dx * dx + dy * dy < acidR2 * lens.a) b = 2;
        }
        f.bucket[i] = b;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 網点の大きさを、斜めにゆっくり流れる波で変調する
      const waveT = reduced ? 0 : time * 0.6;
      const colors = [WHITE, GRAY, ACID, DIM];
      for (let b = 0; b < 4; b++) {
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < f.n; i++) {
          if (f.bucket[i] !== b) continue;
          const tone = 0.8 + 0.2 * Math.sin((f.hx[i] + f.hy[i]) * 0.006 - waveT);
          const r = f.r0[i] * tone * (b === 2 ? 1.15 : b === 1 ? 0.7 : 1);
          if (r < 0.35) continue;
          ctx.moveTo(f.x[i] + r, f.y[i]);
          ctx.arc(f.x[i], f.y[i], r, 0, Math.PI * 2);
          any = true;
        }
        if (any) {
          ctx.fillStyle = colors[b];
          ctx.fill();
        }
      }

      // 読み進めた位置を示す走査線（mark）
      if (!isKv && !reduced && fill > 0.001 && fill < 0.999) {
        const ly = Math.round(f.box.y + f.box.size * fill) + 0.5;
        ctx.fillStyle = ACID;
        ctx.fillRect(w * 0.08, ly - 0.5, w * 0.84, 1);
      }

      // カーソルの十字線と座標（kv）
      if (lensOn && isKv) {
        ctx.globalAlpha = lens.a;
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.fillRect(0, Math.round(lens.y), w, 1);
        ctx.fillRect(Math.round(lens.x), 0, 1, h);
        ctx.strokeStyle = "rgba(255,255,255,0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = ACID;
        ctx.fillRect(Math.round(lens.x) - 2, Math.round(lens.y) - 2, 5, 5);
        ctx.font = hudFont;
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        const label = `X ${(lens.x / w).toFixed(3)}  Y ${(lens.y / h).toFixed(3)}`;
        ctx.fillText(label, Math.round(lens.x) + 10, Math.round(lens.y) - 10);
        ctx.globalAlpha = 1;
      }

      // 衝撃波の輪
      for (let wv = waves.length - 1; wv >= 0; wv--) {
        const age = (now - waves[wv].t) / 1000;
        if (age > 0.9) {
          waves.splice(wv, 1);
          continue;
        }
        const e = 1 - Math.pow(1 - age / 0.9, 3);
        ctx.globalAlpha = 1 - age / 0.9;
        ctx.strokeStyle = ACID;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(waves[wv].x, waves[wv].y, 8 + e * R * 3.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      cb.current.onTick?.({
        pointer: lensOn && target ? { x: lens.x / w, y: lens.y / h } : null,
        fill,
      });
    };

    const loop = (now: number) => {
      raf = 0;
      if (disposed || !visible) return;
      const dtf = last ? Math.min((now - last) / (1000 / 60), 3) : 1;
      last = now;
      draw(now, dtf);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || raf || disposed || !built) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    // フォントを読み込んでから字をサンプリングする
    const init = async () => {
      const bodyFamily = getComputedStyle(document.body).fontFamily || "sans-serif";
      family = bodyFamily;
      hudFont = `500 10px ${bodyFamily}`;
      try {
        await Promise.race([
          document.fonts.load(`900 100px ${bodyFamily}`, "欲"),
          new Promise((r) => setTimeout(r, 2500)),
        ]);
        await document.fonts.ready;
      } catch {
        // 読み込めなくても代替フォントで描く
      }
      if (disposed) return;
      build();
      start();
    };
    void init();

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      if (!built) return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const r = canvas.getBoundingClientRect();
        if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return;
        build();
      }, 120);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "80px 0px" },
    );
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.on = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && !e.relatedTarget) pointer.on = false;
    };
    const onDown = (e: PointerEvent) => {
      if (reduced || !visible) return;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      // ボタンなどの操作では波を立てない
      if ((e.target as Element | null)?.closest?.("a,button,input,textarea,select")) return;
      waves.push({ x, y, t: performance.now() });
      if (waves.length > 4) waves.shift();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });

    return () => {
      disposed = true;
      stop();
      window.clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerout", onLeave);
      field = null;
    };
  }, [variant]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
