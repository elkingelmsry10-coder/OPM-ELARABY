/* OPM V5.4: bounded read transport. No response cache and no data persistence. */
(function (root) {
  'use strict';
  if (root.__opmNetwork54 || typeof root.__opmReadGvizDirect !== 'function') return;
  var read = root.__opmReadGvizDirect, pending = new Map(), queue = [];
  var active = 0, background = 0, sequence = 0, generation = 0;
  var metrics = {started:0,completed:0,failed:0,deduped:0,cancelled:0,peak:0,peakBackground:0,queuedMs:0};
  var LIMIT = 2, BACKGROUND_LIMIT = 1;
  function abortError() { return new DOMException('تم إلغاء القراءة السابقة.', 'AbortError'); }
  function eligible(url, options) {
    if (options.format !== 'api') return false;
    return url.protocol === 'https:' && url.hostname === 'script.google.com' &&
      /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname);
  }
  function priorityFor(options, bg) {
    var value = Number(options.priority);
    if (!Number.isFinite(value)) value = bg ? 9 : 3;
    return bg ? Math.max(8, value) : value;
  }
  function keyFor(url, options) {
    var key = new URL(url.href);
    ['_', '_t', '_r', 't', 'cachebust', 'nocache', 'callback'].forEach(function (name) { key.searchParams.delete(name); });
    key.searchParams.sort();
    // URL retains ifHash, fresh, book, query, transport and all other semantic fields.
    // Per-call transport budgets must never adopt a previous caller's options.
    return generation + '|' + key.href + '|' + String(options.once === true) + '|' + Number(options.timeout || 28000);
  }
  function forget(task) {
    if (pending.get(task.key) === task) pending.delete(task.key);
  }
  function finishWatcher(watcher, error, result) {
    if (watcher.done) return;
    watcher.done = true;
    if (watcher.signal) watcher.signal.removeEventListener('abort', watcher.abort);
    watcher.task.watchers.delete(watcher);
    error ? watcher.reject(error) : watcher.resolve(result);
  }
  function subscribe(task, signal) {
    return new Promise(function (resolve, reject) {
      var watcher = {task:task,signal:signal,resolve:resolve,reject:reject,done:false};
      watcher.abort = function () {
        metrics.cancelled++;
        finishWatcher(watcher, abortError());
        if (!task.watchers.size && task.state === 'queued') {
          task.state = 'cancelled';
          forget(task);
        }
      };
      task.watchers.add(watcher);
      if (signal) {
        signal.addEventListener('abort', watcher.abort, {once:true});
        if (signal.aborted) watcher.abort();
      }
    });
  }
  function choose() {
    var best = -1, score = Infinity, now = Date.now();
    for (var i = 0; i < queue.length; i++) {
      var task = queue[i];
      if (task.state !== 'queued' || !task.watchers.size || task.background && background >= BACKGROUND_LIMIT) continue;
      var rank = task.priority - Math.min(12, Math.floor((now - task.enqueuedAt) / 10000));
      if (rank < score) { best = i; score = rank; }
    }
    return best;
  }
  function drain() {
    queue = queue.filter(function (task) { return task.state === 'queued' && task.watchers.size; });
    while (active < LIMIT) {
      var index = choose();
      if (index < 0) break;
      var task = queue.splice(index, 1)[0];
      start(task);
    }
  }
  function start(task) {
    task.state = 'running';
    active++;
    if (task.background) background++;
    metrics.started++;
    metrics.peak = Math.max(metrics.peak, active);
    metrics.peakBackground = Math.max(metrics.peakBackground, background);
    metrics.queuedMs += Math.max(0, Date.now() - task.enqueuedAt);
    Promise.resolve().then(function () {
      if (!task.watchers.size || task.generation !== generation || root.navigator.onLine === false) throw abortError();
      return read.call(root, task.url, task.options);
    }).then(function (result) {
      if (task.generation !== generation) throw abortError();
      metrics.completed++;
      Array.from(task.watchers).forEach(function (watcher) { finishWatcher(watcher, null, result); });
    }, function (error) {
      metrics.failed++;
      Array.from(task.watchers).forEach(function (watcher) { finishWatcher(watcher, error); });
    }).catch(function (error) {
      metrics.failed++;
      Array.from(task.watchers).forEach(function (watcher) { finishWatcher(watcher, error); });
    }).finally(function () {
      task.state = 'settled';
      forget(task);
      active--;
      if (task.background) background--;
      drain();
    });
  }
  root.__opmReadGvizDirect = function (input, options) {
    options = options || {};
    var url;
    try { url = new URL(input); } catch (_) { return read.call(root, input, options); }
    if (!eligible(url, options)) return read.call(root, input, options);
    if (options.signal && options.signal.aborted) return Promise.reject(abortError());
    if (root.navigator.onLine === false) return Promise.reject(new Error('بدون اتصال · آخر بيانات مؤكدة محفوظة.'));
    var key = keyFor(url, options), task = pending.get(key);
    if (task) {
      metrics.deduped++;
      task.priority = Math.min(task.priority, priorityFor(options, task.background));
    }
    else {
      var operation = url.searchParams.get('op') || 'q';
      var bg = /^(probe|check|batch|stats|ping)$/.test(operation);
      task = {key:key,url:input,options:Object.assign({}, options),operation:operation,background:bg,
        priority:priorityFor(options, bg),
        enqueuedAt:Date.now(),id:++sequence,generation:generation,state:'queued',watchers:new Set()};
      // Each consumer owns its abort signal; cancelling one does not cancel a shared read.
      delete task.options.signal;
      pending.set(key, task);
      queue.push(task);
    }
    var result = subscribe(task, options.signal);
    drain();
    return result;
  };
  function cancelPending() {
    generation++;
    Array.from(pending.values()).forEach(function (task) {
      Array.from(task.watchers).forEach(function (watcher) { metrics.cancelled++; finishWatcher(watcher, abortError()); });
      if (task.state === 'queued') task.state = 'cancelled';
      forget(task);
    });
    queue = [];
    // A JSONP request already accepted by Google cannot be recalled. Keep its slot
    // until transport settles, and suppress its result after the account changes.
  }
  root.document.addEventListener('elAuthStateChanged', function (event) {
    if (event.detail && event.detail.locked) cancelPending();
  });
  root.addEventListener('pagehide', cancelPending);
  root.__opmNetwork54 = Object.freeze({
    version:'5.4',
    snapshot:function () { return Object.assign({active:active,background:background,queued:queue.filter(function (task) {return task.state === 'queued';}).length,limit:LIMIT,backgroundLimit:BACKGROUND_LIMIT}, metrics); }
  });
})(window);
