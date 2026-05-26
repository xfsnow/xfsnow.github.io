// Minimal parser: extracts fenced code / <pre> or lines containing GGB-like tokens
(function(global){
  function parse(input){
    const s = String(input||'');
    let code = null;
    const pre = s.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if(pre) code = pre[1];
    else{
      const fence = s.match(/```(?:\w+)?\r?\n([\s\S]*?)\r?\n```/);
      if(fence) code = fence[1];
    }
    if(!code) code = s.replace(/<[^>]+>/g,'');

    // split by newline/; and filter empty
    const parts = code.split(/\r?\n|;/).map(p=>p.trim()).filter(Boolean);
    // accept lines that look like commands or contain keywords
    const keywords = ['Polygon','Circle','Segment','Tangent','Point','A=','B=','C=','='];
    const out = [];
    for(const p of parts){
      if(/^[A-Za-z0-9_]+\s*=/.test(p) || /[A-Za-z]+\[.*\]/.test(p) || keywords.some(k=>p.indexOf(k)!==-1)) out.push(p);
    }
    return out;
  }
  window.GGBParser = {parse};
})(window);
