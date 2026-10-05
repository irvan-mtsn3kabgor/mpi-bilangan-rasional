(function(){
  const STORAGE_KEY = 'lkpd_bilangan_rasional_v2';
  const ANSWER_KEY = 'lkpd_answers_v2';
  const identity = {studentName:'', studentClass:''};

  const tfP1Data = [
    {text:'Bilangan 1/2 merupakan bilangan rasional.', answer:'B'},
    {text:'Bilangan 5 dapat ditulis sebagai 5/1.', answer:'B'},
    {text:'Penyebut suatu bilangan rasional boleh bernilai 0.', answer:'S'},
    {text:'Bilangan 0,75 merupakan bilangan rasional.', answer:'B'}
  ];

  const fracToDecData = [
    {left:'1/2', answer:['0,5','0.5']},
    {left:'1/4', answer:['0,25','0.25']},
    {left:'3/4', answer:['0,75','0.75']},
    {left:'1/5', answer:['0,2','0.2']},
    {left:'7/10', answer:['0,7','0.7']}
  ];

  const decToFracData = [
    {left:'0,5', answer:['1/2']},
    {left:'0,25', answer:['1/4','25/100']},
    {left:'0,75', answer:['3/4','75/100']},
    {left:'0,2', answer:['1/5','2/10']},
    {left:'0,8', answer:['4/5','8/10']}
  ];

  const matchP2Data = [
    {label:'1/2', right:'0,5'},
    {label:'1/4', right:'0,25'},
    {label:'3/4', right:'0,75'},
    {label:'1/5', right:'0,2'}
  ];

  const symbolData = [
    ['1/2','0,75','<'],
    ['3/4','0,75','='],
    ['0,25','1/2','<'],
    ['2/5','0,5','<'],
    ['1,25','1 1/4','=']
  ];

  const p3MatchAnswers = {
    p3c1:'tengah antara 0 dan 1',
    p3c2:'tengah antara 1 dan 2',
    p3c3:'tengah antara −1 dan 0',
    p3c4:'tengah antara 2 dan 3'
  };

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  function getStore(){
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function setStore(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
  function getAnswers(){
    try { return JSON.parse(localStorage.getItem(ANSWER_KEY) || '{}'); }
    catch(e){ return {}; }
  }
  function setAnswers(obj){ localStorage.setItem(ANSWER_KEY, JSON.stringify(obj)); }
  function saveAnswer(key, value){ const data=getAnswers(); data[key]=value; setAnswers(data); }
  function loadAnswer(key, fallback=''){ return getAnswers()[key] || fallback; }

  function normalize(s){
    return String(s || '')
      .toLowerCase()
      .replace(/\s+/g,' ')
      .replace(/,/g,'.')
      .replace(/−/g,'-')
      .trim();
  }

  function normalizeLoose(s){
    return normalize(s).replace(/\s*;\s*/g,';').replace(/\s*-\s*/g,'-');
  }

  function splitAlternatives(value){
    return String(value || '').includes('|') ? String(value).split('|') : String(value).split(',');
  }

  function matches(input, correctAttr){
    const current = normalizeLoose(input);
    const alts = splitAlternatives(correctAttr).map(v=>normalizeLoose(v));
    return alts.includes(current);
  }

  function feedback(id, text, ok=false){
    const el = typeof id === 'string' ? qs('#'+id) : id;
    if(!el) return;
    el.textContent = text;
    el.classList.remove('ok','warn');
    el.classList.add(ok ? 'ok' : 'warn');
  }

  function showPage(pageId){
    qsa('.page').forEach(p=>p.classList.toggle('active', p.id===pageId));
    qsa('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.page===pageId));
    const pages = qsa('.page');
    const index = pages.findIndex(p=>p.id===pageId);
    qs('#progressFill').style.width = ((index+1)/pages.length*100)+'%';
    qs('#progressText').textContent = `Halaman ${index+1} dari ${pages.length}`;
    window.scrollTo({top:0, behavior:'smooth'});
    persistProgress(pageId, index+1);
  }

  async function persistProgress(pageId, idx){
    const payload = { pageId, pageIndex: idx, title: qs('#'+pageId)?.dataset.title || pageId, ts:new Date().toISOString(), ...identity };
    saveAnswer('lastPage', pageId);
    setStore({...getStore(), lastProgress: payload});
    await window.AppAPI.saveProgress(payload);
    updateSyncStatus();
  }

  async function saveIdentity(){
    identity.studentName = qs('#studentName').value.trim();
    identity.studentClass = qs('#studentClass').value.trim();
    if(!identity.studentName || !identity.studentClass){
      alert('Silakan isi nama murid dan pilih kelas terlebih dahulu.');
      return;
    }
    setStore({...getStore(), identity});
    const res = await window.AppAPI.saveIdentity({...identity, ts:new Date().toISOString(), source:'github-pages'});
    updateSyncStatus();
    alert(res.queued ? 'Identitas disimpan lokal dan akan disinkronkan saat online.' : 'Identitas berhasil disimpan.');
  }

  function loadIdentity(){
    const store = getStore();
    if(store.identity){
      identity.studentName = store.identity.studentName || '';
      identity.studentClass = store.identity.studentClass || '';
      qs('#studentName').value = identity.studentName;
      qs('#studentClass').value = identity.studentClass;
    }
  }

  function updateSyncStatus(){
    const el = qs('#syncStatus');
    const queueLen = window.AppAPI.getQueue().length;
    if(navigator.onLine){
      el.textContent = queueLen ? `Online • antrean ${queueLen}` : 'Online • tersinkron';
      el.className = 'sync-status online';
    } else {
      el.textContent = queueLen ? `Offline • antrean ${queueLen}` : 'Mode offline';
      el.className = 'sync-status offline';
    }
  }

  async function doManualSync(){
    const result = await window.AppAPI.flushQueue();
    updateSyncStatus();
    alert(`Sinkron selesai. Berhasil: ${result.sent}, gagal/tersisa: ${result.failed}`);
  }

  function renderTfP1(){
    const wrap = qs('#tfP1');
    wrap.innerHTML = tfP1Data.map((item, i)=>`
      <div class="tf-item">
        <p>${i+1}. ${item.text}</p>
        <div class="tf-options">
          <label class="radio-inline"><input type="radio" name="tf${i}" value="B" ${loadAnswer('tf'+i)==='B'?'checked':''}> Benar</label>
          <label class="radio-inline"><input type="radio" name="tf${i}" value="S" ${loadAnswer('tf'+i)==='S'?'checked':''}> Salah</label>
        </div>
      </div>
    `).join('');
    qsa('input[type="radio"]', wrap).forEach(r=>r.addEventListener('change', ()=>saveAnswer(r.name, r.value)));
  }

  function checkTfP1(){
    let score = 0;
    tfP1Data.forEach((item, i)=>{
      const chosen = qs(`input[name="tf${i}"]:checked`);
      if(chosen && chosen.value === item.answer) score++;
    });
    feedback('fb-tfP1', `Jawaban benar ${score} dari ${tfP1Data.length}.`, score === tfP1Data.length);
    saveAnswer('score_tfP1', score);
  }

  function checkKategoriP1(){
    const expected = {
      'kat-bulat':['3'],
      'kat-biasa':['1/2','-3/4'],
      'kat-campuran':['2 1/2'],
      'kat-desimal':['0,25','1,5']
    };
    let okCount=0;
    Object.keys(expected).forEach(key=>{
      const current = normalizeLoose(qs(`[data-key="${key}"]`).value).split(/\s*;\s*/).filter(Boolean);
      const sortedCurrent = [...new Set(current)].sort().join('|');
      const sortedExpected = expected[key].map(normalizeLoose).sort().join('|');
      if(sortedCurrent===sortedExpected) okCount++;
    });
    const allOk = okCount===4;
    feedback('fb-kategoriP1', allOk ? 'Semua kategori sudah tepat.' : `Kategori tepat ${okCount} dari 4. Cek lagi pecahan campuran, pecahan biasa, dan desimal.`, allOk);
    saveAnswer('score_kategoriP1', okCount);
  }

  function checkShortInputs(containerSelector, fbId){
    const inputs = qsa(`${containerSelector} .short-answer, ${containerSelector}.short-answer, ${containerSelector} .short-answer`);
    let correct=0;
    inputs.forEach(inp=>{ if(matches(inp.value, inp.dataset.correct)) correct++; });
    const total = inputs.length;
    feedback(fbId, `Jawaban objektif benar ${correct} dari ${total}.`, correct===total);
    return {correct, total};
  }

  function renderMathList(targetId, data, type){
    const wrap = qs('#'+targetId);
    wrap.innerHTML = data.map((item, i)=>{
      const key = `${targetId}_${i}`;
      const left = type==='fraction' ? fracHTML(item.left) : item.left;
      return `<div class="math-item"><div>${left}</div><div class="eq">=</div><input data-answer-key="${key}" value="${loadAnswer(key)}" /></div>`;
    }).join('');
    qsa('input', wrap).forEach(inp=>inp.addEventListener('input', ()=>saveAnswer(inp.dataset.answerKey, inp.value)));
  }

  function fracHTML(text){
    if(!text.includes('/')) return text;
    const [a,b]=text.split('/');
    return `<span class="vfrac"><span class="top">${a}</span><span class="bottom">${b}</span></span>`;
  }

  function checkMathList(targetId, data, fbId){
    const inputs = qsa(`#${targetId} input`);
    let correct=0;
    inputs.forEach((inp, i)=>{
      if(data[i].answer.map(normalizeLoose).includes(normalizeLoose(inp.value))) correct++;
    });
    feedback(fbId, `Benar ${correct} dari ${data.length}.`, correct===data.length);
    saveAnswer(`score_${targetId}`, correct);
  }

  function renderMatchingP2(){
    const left = qs('#matchFracCol');
    const right = qs('#matchDecCol');
    left.innerHTML = matchP2Data.map((item,i)=>{
      const key = `matchP2_${i}`;
      return `<div class="match-card"><span>${fracHTML(item.label)}</span><select data-answer-key="${key}"><option value="">Pilih desimal</option><option>0,5</option><option>0,25</option><option>0,75</option><option>0,2</option></select></div>`;
    }).join('');
    right.innerHTML = matchP2Data.map((item)=>`<div class="match-card"><span>${item.right}</span></div>`).join('');
    qsa('select', left).forEach((sel,i)=>{
      sel.value = loadAnswer(sel.dataset.answerKey);
      sel.addEventListener('change', ()=>saveAnswer(sel.dataset.answerKey, sel.value));
    });
  }

  function checkMatchingP2(){
    let correct=0;
    qsa('#matchFracCol select').forEach((sel,i)=>{
      if(normalizeLoose(sel.value) === normalizeLoose(matchP2Data[i].right)) correct++;
    });
    feedback('fb-matchingP2', `Pasangan benar ${correct} dari ${matchP2Data.length}.`, correct===matchP2Data.length);
  }

  function renderSymbols(){
    const wrap = qs('#symbolList');
    wrap.innerHTML = symbolData.map((row, i)=>{
      const key = `symbol_${i}`;
      const left = row[0].includes('/') ? fracHTML(row[0]) : row[0];
      const right = row[1].includes('/') ? fracHTML(row[1]) : row[1];
      return `<div class="symbol-row"><div>${i+1}. ${left}</div><select data-answer-key="${key}"><option value="">Pilih</option><option>&lt;</option><option>&gt;</option><option>=</option></select><div>${right}</div></div>`;
    }).join('');
    qsa('#symbolList select').forEach(sel=>{
      sel.value = loadAnswer(sel.dataset.answerKey);
      sel.addEventListener('change', ()=>saveAnswer(sel.dataset.answerKey, sel.value));
    });
  }

  function checkSymbols(){
    let correct=0;
    qsa('#symbolList select').forEach((sel,i)=>{ if(sel.value === symbolData[i][2]) correct++; });
    feedback('fb-symbols', `Jawaban benar ${correct} dari ${symbolData.length}.`, correct===symbolData.length);
  }

  function checkOrder(){
    const o1 = normalizeLoose(qs('[data-order="o1"]').value).replace(/\s*;\s*/g,';');
    const o2 = normalizeLoose(qs('[data-order="o2"]').value).replace(/\s*;\s*/g,';');
    const a1 = normalizeLoose('0,25;0,5;0,75;1').replace(/\s*;\s*/g,';');
    const a2alts = ['1/4;1/2;3/4;1','1/4; 1/2; 3/4; 1'].map(v=>normalizeLoose(v).replace(/\s*;\s*/g,';'));
    const ok1 = o1===a1;
    const ok2 = a2alts.includes(o2);
    const total = (ok1?1:0)+(ok2?1:0);
    feedback('fb-order', `Urutan benar ${total} dari 2.`, total===2);
  }

  function checkCatFinal(){
    const expected = {
      lessHalf:['0,25','1/4','2/5'],
      equalHalf:['0,5'],
      moreHalf:['3/4','0,8']
    };
    let ok=0;
    Object.keys(expected).forEach(key=>{
      const current = normalizeLoose(qs(`[data-key="${key}"]`).value).split(/\s*;\s*/).filter(Boolean);
      if([...new Set(current)].sort().join('|')===expected[key].map(normalizeLoose).sort().join('|')) ok++;
    });
    feedback('fb-catFinal', `Kategori tepat ${ok} dari 3.`, ok===3);
  }

  function restoreGenericFields(){
    qsa('textarea.free-answer, input.short-answer, .category-grid input, [data-order]').forEach((el, idx)=>{
      const key = el.dataset.item || el.dataset.target || el.dataset.key || el.dataset.order || ('field_'+idx);
      el.value = loadAnswer(key);
      el.addEventListener('input', ()=>saveAnswer(key, el.value));
    });
    qsa('[data-match]').forEach(sel=>{
      sel.value = loadAnswer(sel.dataset.match);
      sel.addEventListener('change', ()=>saveAnswer(sel.dataset.match, sel.value));
    });
  }

  function checkP3C(){
    let correct = 0;
    Object.keys(p3MatchAnswers).forEach(key=>{
      const current = qs(`[data-match="${key}"]`).value.toLowerCase().trim();
      if(current === p3MatchAnswers[key]) correct++;
    });
    feedback('fb-p3c', `Pasangan benar ${correct} dari 4.`, correct===4);
  }

  async function submitAllResults(){
    identity.studentName = qs('#studentName').value.trim();
    identity.studentClass = qs('#studentClass').value.trim();
    if(!identity.studentName || !identity.studentClass){
      feedback('fb-submitAll', 'Isi identitas murid dan pilih kelas terlebih dahulu.', false);
      return;
    }
    const payload = {
      ...identity,
      ts: new Date().toISOString(),
      answers: getAnswers(),
      pageVisited: loadAnswer('lastPage') || 'page1'
    };
    const res = await window.AppAPI.saveWorksheetResult(payload);
    feedback('fb-submitAll', res.queued ? 'Hasil LKPD disimpan lokal dan masuk antrean sinkron.' : 'Hasil LKPD berhasil dikirim ke Google Sheet.', !res.queued);
    updateSyncStatus();
  }

  function bindEvents(){
    qsa('.nav-btn').forEach(btn=>btn.addEventListener('click', ()=>showPage(btn.dataset.page)));
    qs('#saveIdentityBtn').addEventListener('click', saveIdentity);
    qs('#syncNowBtn').addEventListener('click', doManualSync);

    qsa('button[data-check="tfP1"]').forEach(btn=>btn.addEventListener('click', checkTfP1));
    qs('#checkKategoriP1').addEventListener('click', checkKategoriP1);
    qs('#checkStemP1').addEventListener('click', ()=>checkShortInputs('#page2', 'fb-stemP1'));

    qs('#checkFracToDec').addEventListener('click', ()=>checkMathList('fracToDec', fracToDecData, 'fb-fracToDec'));
    qs('#checkDecToFrac').addEventListener('click', ()=>checkMathList('decToFrac', decToFracData, 'fb-decToFrac'));
    qs('#checkMatchingP2').addEventListener('click', checkMatchingP2);
    qs('#checkStemP2').addEventListener('click', ()=>checkShortInputs('#page4', 'fb-stemP2'));

    qs('#checkP3A').addEventListener('click', ()=>checkShortInputs('#page6 .line-task-grid', 'fb-p3a'));
    qs('#checkP3B').addEventListener('click', ()=>checkShortInputs('#page6 .between-grid', 'fb-p3b'));
    qs('#checkP3C').addEventListener('click', checkP3C);
    qs('#checkP3D').addEventListener('click', ()=>checkShortInputs('#page6 .soft-card.green', 'fb-p3d'));

    qs('#checkSymbols').addEventListener('click', checkSymbols);
    qs('#checkOrder').addEventListener('click', checkOrder);
    qs('#checkCatFinal').addEventListener('click', checkCatFinal);
    qs('#checkStemP4D').addEventListener('click', ()=>checkShortInputs('#page8 .soft-card.peach.span2', 'fb-stemP4D'));
    qs('#checkStemP4E').addEventListener('click', ()=>checkShortInputs('#page8 .soft-card.blue.span2', 'fb-stemP4E'));
    qs('#submitAllBtn').addEventListener('click', submitAllResults);

    window.addEventListener('online', async()=>{ await window.AppAPI.flushQueue(); updateSyncStatus(); });
    window.addEventListener('offline', updateSyncStatus);
  }

  function init(){
    loadIdentity();
    renderTfP1();
    renderMathList('fracToDec', fracToDecData, 'fraction');
    renderMathList('decToFrac', decToFracData, 'decimal');
    renderMatchingP2();
    renderSymbols();
    restoreGenericFields();
    bindEvents();
    const lastPage = loadAnswer('lastPage','page1');
    showPage(lastPage);
    updateSyncStatus();
    window.AppAPI.flushQueue().then(updateSyncStatus).catch(()=>{});
  }

  document.addEventListener('DOMContentLoaded', init);
})();
