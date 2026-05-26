// Minimal GeoGebra adapter: loads deployggb script and exposes small API
(function(global){
  const GGB_URL = 'https://cdn.geogebra.org/apps/deployggb.js';
  let libLoaded = (typeof GGBApplet !== 'undefined');
  let loading = false;

  function loadLib(){
    return new Promise((resolve,reject)=>{
      if(libLoaded) return resolve();
      if(loading) return setTimeout(()=>resolve(loadLib()),200);
      loading=true;
      const s=document.createElement('script'); s.src=GGB_URL; s.onload=()=>{libLoaded=true;loading=false;resolve();}; s.onerror=()=>reject(new Error('Failed to load GeoGebra')); document.head.appendChild(s);
    });
  }

  function createApplet(containerId, opts={width:'100%',height:360,appName:'classic'}){
    return loadLib().then(()=>{
      return new Promise((resolve)=>{
        const options = Object.assign({}, opts, {id:containerId, width:opts.width, height:opts.height, appletOnLoad:(applet)=>{resolve(applet);}});
        const app = new GGBApplet(options, true);
        app.inject(containerId);
        // safety: resolve with window.ggbApplet fallback after short poll if not yet delivered
        setTimeout(()=>{ if(window.ggbApplet) resolve(window.ggbApplet); },800);
      });
    });
  }

  async function executeCommands(applet, commands=[]){
    const errors=[];
    for(const c of commands){
      try{ if(typeof applet.evalCommand==='function') applet.evalCommand(c); else console.warn('evalCommand not available'); }
      catch(e){ errors.push({command:c,error:(e&&e.message)||String(e)}); }
    }
    return {errors,success:errors.length===0};
  }

  function zoomFit(applet){ try{ if(applet && typeof applet.evalCommand==='function') applet.evalCommand('ZoomFit[]'); }catch(e){}}
  function clear(applet){ try{ if(applet && typeof applet.evalCommand==='function') applet.evalCommand('Clear[]'); }catch(e){} }
  function listObjects(applet){ try{ if(typeof applet.getAllObjectNames==='function') return applet.getAllObjectNames(); if(typeof applet.getObjectNames==='function') return applet.getObjectNames(); return []; }catch(e){return []} }
  function setSize(applet,w,h){ try{ if(applet && typeof applet.setSize==='function') applet.setSize(w,h); }catch(e){} }

  global.GGBAdapter = {loadLib,createApplet,executeCommands,zoomFit,clear,listObjects,setSize};
})(window);
