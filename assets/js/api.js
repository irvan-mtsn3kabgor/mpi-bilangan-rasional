(function(){
  const cfg = window.APP_CONFIG || {};
  const queueKey = `${cfg.APP_ID || 'mpi'}:syncQueue`;

  function endpointReady(){
    return Boolean(cfg.ENABLE_REMOTE_SYNC && cfg.GAS_ENDPOINT && /^https:\/\//.test(cfg.GAS_ENDPOINT));
  }

  async function post(action, payload={}){
    if(!endpointReady()) throw new Error('GAS endpoint belum dikonfigurasi');
    const controller = new AbortController();
    const timer = setTimeout(()=>controller.abort(), cfg.API_TIMEOUT_MS || 8000);
    try{
      const res = await fetch(cfg.GAS_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action, appId:cfg.APP_ID, payload}),
        signal:controller.signal
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if(!data.ok) throw new Error(data.message || 'Server menolak permintaan');
      return data;
    } finally { clearTimeout(timer); }
  }

  function enqueue(action,payload){
    const q = JSON.parse(localStorage.getItem(queueKey) || '[]');
    q.push({action,payload,queuedAt:new Date().toISOString()});
    localStorage.setItem(queueKey,JSON.stringify(q.slice(-100)));
  }

  async function safePost(action,payload){
    try{
      const result = await post(action,payload);
      return {ok:true,result};
    } catch(err){
      enqueue(action,payload);
      return {ok:false,error:err.message};
    }
  }

  async function flushQueue(){
    if(!endpointReady() || !navigator.onLine) return {ok:false,count:0};
    const q = JSON.parse(localStorage.getItem(queueKey) || '[]');
    if(!q.length) return {ok:true,count:0};
    const pending=[]; let sent=0;
    for(const item of q){
      try{ await post(item.action,item.payload); sent++; }
      catch(e){ pending.push(item); }
    }
    localStorage.setItem(queueKey,JSON.stringify(pending));
    return {ok:pending.length===0,count:sent,pending:pending.length};
  }

  window.MPI_API={post,safePost,flushQueue,endpointReady};
})();
