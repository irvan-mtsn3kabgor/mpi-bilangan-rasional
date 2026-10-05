(function(){
  const QUEUE_KEY = 'lkpd_sync_queue_v2';

  function getQueue(){
    try{return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');}
    catch(e){return [];}
  }

  function setQueue(queue){
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  function endpointReady(){
    return window.APP_CONFIG && window.APP_CONFIG.GAS_ENDPOINT && !window.APP_CONFIG.GAS_ENDPOINT.includes('PASTE_YOUR_DEPLOYMENT_ID');
  }

  async function postJSON(payload){
    if(!window.APP_CONFIG.ENABLE_REMOTE_SYNC || !endpointReady()){
      throw new Error('Endpoint Google Apps Script belum diatur.');
    }
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), window.APP_CONFIG.API_TIMEOUT_MS || 8000);
    try{
      const res = await fetch(window.APP_CONFIG.GAS_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify(payload),
        signal:controller.signal
      });
      const text = await res.text();
      try{return JSON.parse(text);}catch(e){return {ok: res.ok, raw: text};}
    } finally {
      clearTimeout(timer);
    }
  }

  async function sendOrQueue(payload){
    try{
      const result = await postJSON(payload);
      return {ok:true, queued:false, result};
    } catch(err){
      const queue = getQueue();
      queue.push(payload);
      setQueue(queue);
      return {ok:false, queued:true, error: String(err && err.message || err)};
    }
  }

  async function flushQueue(){
    const queue = getQueue();
    if(!queue.length) return {sent:0, failed:0};
    const remain = [];
    let sent = 0;
    for(const item of queue){
      try{
        await postJSON(item);
        sent++;
      } catch(err){
        remain.push(item);
      }
    }
    setQueue(remain);
    return {sent, failed:remain.length};
  }

  window.AppAPI = {
    getQueue,
    flushQueue,
    saveIdentity(data){
      return sendOrQueue({action:'registerStudent', appId: window.APP_CONFIG.APP_ID, payload:data});
    },
    saveProgress(data){
      return sendOrQueue({action:'saveProgress', appId: window.APP_CONFIG.APP_ID, payload:data});
    },
    saveWorksheetResult(data){
      return sendOrQueue({action:'saveWorksheetResult', appId: window.APP_CONFIG.APP_ID, payload:data});
    }
  };
})();
