// Minimal AI client shim. Replace implementation to call real backend later.
(function(global){
  // Simple settings store
  let settings = { provider: '', endpoint: '', apiKey: '', model: '' };

  function setSettings(s){ settings = Object.assign(settings,s||{}); }

  // sendMessage returns a promise resolving to an assistant-like response object
  // For now it contains a simple rule-based fallback to generate GeoGebra commands
  function sendMessage(userMessage){
    return new Promise((resolve)=>{
      // very small heuristic: if user asks for 等边三角形 or 三角形, return a sample command block
      const lower = (userMessage||'').toLowerCase();
      let content = '';
      if(lower.indexOf('等边三角') !== -1 || lower.indexOf('等边三角形') !== -1){
        content = ['```','A = (0, 0)','B = (2, 0)','C = (1, sqrt(3))','Polygon[A, B, C]','```'].join('\n');
      } else if(lower.indexOf('圆') !== -1 && /\d/.test(userMessage)){
        // try to extract a number as radius
        const m = userMessage.match(/(\d+(?:\.\d+)?)/);
        const r = m?m[1]:'2';
        content = ['```','A = (0, 0)','Circle[A, '+r+']','```'].join('\n');
      } else {
        // generic echo: wrap in code fence to encourage parser
        content = '```\n' + userMessage + '\n```';
      }

      // simulate async latency
      setTimeout(()=>{
        resolve({ content });
      }, 400);
    });
  }

  global.AIClient = { setSettings, sendMessage };
})(window);
