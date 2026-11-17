/* OPM V5.2: optional wire transport. No business calculations or persisted data. */
(function (root) {
  'use strict';
  var features = new Set(), pending = null, currentEndpoint = '', expires = 0;
  function endpointURL() {
    return String(root.OPM_GATEWAY_URL || root.OPM_CONFIG?.gateway || '');
  }
  function decode(reply) {
    if (!reply || reply.encoding !== 'cells-v1') return reply;
    if (!reply.table || !Array.isArray(reply.table.cellRows) || reply.table.rows) throw Error('Invalid compact table');
    var out = Object.assign({}, reply), table = Object.assign({}, reply.table);
    table.rows = table.cellRows.map(function (row) {
      if (!Array.isArray(row)) return row;
      return {c:row.map(function (cell) {
        if (!Array.isArray(cell)) return cell;
        if (cell.length === 1) return {v:cell[0]};
        if (cell.length === 2) return {v:cell[0],f:cell[1]};
        throw Error('Invalid compact cell');
      })};
    });
    delete table.cellRows;
    delete out.encoding;
    out.table = table;
    return out;
  }
  function init() {
    var endpoint = endpointURL();
    if (endpoint !== currentEndpoint) {
      currentEndpoint = endpoint;
      pending = null;
      expires = 0;
      features = new Set();
    }
    if (pending) return pending;
    if (expires > Date.now()) return Promise.resolve(Array.from(features));
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint) ||
        typeof root.__opmReadGvizDirect !== 'function') return Promise.resolve([]);
    var key = 'opm:v52:gateway-features:' + endpoint;
    try {
      var saved = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (Array.isArray(saved?.items) && saved.expires > Date.now()) {
        features = new Set(saved.items);
        expires = saved.expires;
        return Promise.resolve(saved.items);
      }
    } catch (_) {}
    var url = new URL(endpoint); url.searchParams.set('op','ping');
    // Never await this handshake on the data-loading path. Until ready, use legacy format.
    var flight = root.__opmReadGvizDirect(url.href,{format:'api',once:true,timeout:8000,priority:9})
      .then(function (reply) {
        if (!reply?.ok || !Array.isArray(reply.features)) throw Error('Invalid gateway capabilities');
        var items = reply.features.filter(function (x) { return typeof x === 'string'; });
        if (pending !== flight) return items;
        features = new Set(items);
        expires = Date.now() + 300000;
        try { sessionStorage.setItem(key,JSON.stringify({items:items,expires:expires})); } catch (_) {}
        return items;
      }).catch(function () {
        if (pending === flight) { features = new Set(); expires = Date.now() + 30000; }
        return [];
      }).finally(function () {
        if (pending === flight) pending = null;
      });
    return pending = flight;
  }
  root.__opmTransport52 = Object.freeze({decode:decode,init:init,has:function (name) {
    if (currentEndpoint !== endpointURL() || !pending && expires <= Date.now()) init();
    return features.has(name);
  }});
})(window);
