(function(){
  const chat = document.getElementById('chat');
  const input = document.getElementById('input');
  const composer = document.getElementById('composer');
  const btnZoom = document.getElementById('btn-zoom');
  const btnClear = document.getElementById('btn-clear');
  const fixedEl = 'ggb-fixed';
  let fixedApplet = null;
  const settingsModal = document.getElementById('settings-modal');
  const openSettingsBtn = document.getElementById('open-settings');
  const closeSettingsBtn = document.getElementById('close-settings');
  const saveSettingsBtn = document.getElementById('save-settings');
  const inputEndpoint = document.getElementById('setting-endpoint');
  const inputApiKey = document.getElementById('setting-apikey');
  const inputModel = document.getElementById('setting-model');

  function loadSettingsToUi(){
    try{
      const s = JSON.parse(localStorage.getItem('chatgg_settings')||'{}');
      inputEndpoint.value = s.endpoint||'';
      inputApiKey.value = s.apiKey||'';
      inputModel.value = s.model||'';
      AIClient.setSettings({ endpoint: s.endpoint, apiKey: s.apiKey, model: s.model });
    }catch(e){}
  }

  openSettingsBtn.addEventListener('click', ()=>{ loadSettingsToUi(); settingsModal.style.display='flex'; });
  closeSettingsBtn.addEventListener('click', ()=>{ settingsModal.style.display='none'; });
  saveSettingsBtn.addEventListener('click', ()=>{
    const s = { endpoint: inputEndpoint.value.trim(), apiKey: inputApiKey.value.trim(), model: inputModel.value.trim() };
    localStorage.setItem('chatgg_settings', JSON.stringify(s));
    AIClient.setSettings({ provider:'custom', apiKey: s.apiKey, endpoint: s.endpoint, model: s.model });
    addMessage('设置已保存','note');
    settingsModal.style.display='none';
  });

  // initialize UI settings
  loadSettingsToUi();

  function addMessage(text,cls){
    const m=document.createElement('div'); m.className='message '+(cls||''); m.innerHTML = '<pre>'+escapeHtml(text)+'</pre>'; chat.appendChild(m); chat.scrollTop = chat.scrollHeight; return m;
  }
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // create fixed applet
  GGBAdapter.createApplet(fixedEl,{width:'100%',height:360}).then(app=>{ fixedApplet=app; console.log('fixed applet ready'); addMessage('Fixed GeoGebra 画板已就绪','note'); }).catch(e=>{ console.warn('fixed applet failed',e); addMessage('Fixed applet load failed: '+e.message,'note'); });

  composer.addEventListener('submit',async function(e){
    e.preventDefault();
    const txt = input.value.trim();
    if(!txt) return;
    input.value='';
    addMessage('你: '+txt,'');

    // send to AI client
    addMessage('正在与 AI 交互...','note');
    try{
      const resp = await AIClient.sendMessage(txt);
      const assistantText = (resp && resp.content) ? resp.content : String(resp || '');
      // display assistant
      addMessage('AI:');
      const assistantNode = document.createElement('div'); assistantNode.className='message'; assistantNode.innerHTML = '<pre>'+escapeHtml(assistantText)+'</pre>'; chat.appendChild(assistantNode); chat.scrollTop = chat.scrollHeight;

      // extract commands from assistant response
      const cmds = GGBParser.parse(assistantText);
      addMessage('解析到命令: '+JSON.stringify(cmds),'note');

      if(cmds.length===0){ addMessage('未识别到任何 GeoGebra 命令。请使用 ``` 代码块或明确的赋值语句。','note'); return; }

      // execute on fixed applet if available
      if(fixedApplet){
        addMessage('在固定画板上执行命令...','note');
        const res = await GGBAdapter.executeCommands(fixedApplet,cmds);
        if(res.errors && res.errors.length) addMessage('执行错误: '+JSON.stringify(res.errors),'note');
        else addMessage('命令执行成功。','note');
        try{ GGBAdapter.zoomFit(fixedApplet); }catch(e){}
        return;
      }

      // fallback: create per-message container
      addMessage('固定画板不可用，创建临时画板执行命令','note');
      const id = 'ggb-msg-'+Date.now(); const card=document.createElement('div'); card.className='message'; card.innerHTML = '<div id="'+id+'" style="width:100%;height:300px"></div>'; chat.appendChild(card);
      const app = await GGBAdapter.createApplet(id,{width:'100%',height:300});
      const r = await GGBAdapter.executeCommands(app,cmds);
      if(r.errors && r.errors.length) addMessage('执行错误: '+JSON.stringify(r.errors),'note'); else addMessage('命令已在临时画板执行。','note');
    }catch(err){
      addMessage('AI 交互失败: '+(err && err.message),'note');
    }
  });

  btnZoom.addEventListener('click',()=>{ if(fixedApplet){ GGBAdapter.zoomFit(fixedApplet); addMessage('ZoomFit executed','note'); } });
  btnClear.addEventListener('click',()=>{ if(fixedApplet){ GGBAdapter.clear(fixedApplet); addMessage('Cleared fixed applet','note'); } });

})();
