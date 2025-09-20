// editorEnv.js
// Centralized environment-aware helpers for navigating to the lesson Editor build.
// Usage: include this script before any inline code that calls getEditorBase()/buildEditorUrl.

(function(global){
  function isLocalHost(){
    const h = location.hostname;
    return h === 'localhost' || h === '127.0.0.1';
  }
  function getEditorBase(){
    const base = isLocalHost() ? 'http://localhost:5173/' : '/Editor/dist/index.html';
    if (!global.__EDITOR_ENV_LOGGED__) {
      console.debug('[editor-env]', { hostname: location.hostname, chosen: base, local: isLocalHost() });
      global.__EDITOR_ENV_LOGGED__ = true;
    }
    return base;
  }
  function buildEditorUrl(paramsObj){
    const base = getEditorBase();
    const params = new URLSearchParams(paramsObj || {});
    const sep = base.includes('?') ? '&' : '?';
    return base + (params.toString() ? (sep + params.toString()) : '');
  }
  global.getEditorBase = getEditorBase;
  global.buildEditorUrl = buildEditorUrl;
})(window);
