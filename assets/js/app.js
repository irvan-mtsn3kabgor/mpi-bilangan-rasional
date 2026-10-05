const LS_KEY = `${APP_CONFIG.APP_ID}:state`;
const state = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
state.student ||= {name:'',className:''};
state.progress ||= {};

const quizData=[
 {q:'Pecahan 3/5 berarti ...',o:['Keseluruhan dibagi 3 dan diambil 5','Keseluruhan dibagi 5 bagian sama besar dan diambil 3','3 ditambah 5','5 dibagi 3 tanpa makna bagian'],a:1,e:'Penyebut 5 menunjukkan jumlah bagian sama besar. Pembilang 3 menunjukkan bagian yang diperhatikan.'},
 {q:'Pecahan yang senilai dengan 2/3 adalah ...',o:['3/4','4/6','4/5','6/12'],a:1,e:'2/3 × 2/2 = 4/6. Mengalikan pembilang dan penyebut dengan faktor yang sama tidak mengubah nilai.'},
 {q:'Hubungan yang benar antara 3/4 dan 2/3 adalah ...',o:['3/4 < 2/3','3/4 = 2/3','3/4 > 2/3','Tidak dapat dibandingkan'],a:2,e:'Perkalian silang: 3×3=9 dan 2×4=8. Karena 9>8, maka 3/4>2/3.'},
 {q:'Seorang nelayan membawa 16 ikan dan menjual 12 ekor. Pecahan yang terjual dalam bentuk paling sederhana adalah ...',o:['1/4','1/2','2/3','3/4'],a:3,e:'12/16 disederhanakan dengan membagi pembilang dan penyebut dengan 4 sehingga menjadi 3/4.'},
 {q:'Urutan pecahan dari terkecil ke terbesar adalah ...',o:['3/4, 2/3, 1/2','1/2, 2/3, 3/4','2/3, 1/2, 3/4','1/2, 3/4, 2/3'],a:1,e:'1/2=0,5; 2/3≈0,667; 3/4=0,75.'}
];
let quizIndex=0, quizScore=0, quizSelection=null, quizChecked=false;
let comparison={aN:3,aD:4,bN:2,bD:3};
const comparisons=[[3,4,2,3],[1,2,3,5],[4,6,2,3],[5,8,3,4],[2,5,1,2],[5,6,7,8]];

function saveLocal(){localStorage.setItem(LS_KEY,JSON.stringify(state));}
function studentPayload(extra={}){return {studentName:state.student.name,studentClass:state.student.className,...extra};}
function setStatus(text,type=''){const el=document.getElementById('syncStatus');el.textContent=text;el.className='status '+type;}
async function sync(action,payload){setStatus('Menyimpan…','');const r=await MPI_API.safePost(action,studentPayload(payload));setStatus(r.ok?'Tersinkron ke Google Sheet':'Tersimpan lokal, menunggu koneksi',r.ok?'online':'error');}

function renderBar(id,n,d){const el=document.getElementById(id);el.innerHTML='';el.style.gridTemplateColumns=`repeat(${d},1fr)`;for(let i=0;i<d;i++){const p=document.createElement('div');p.className='bar-piece'+(i<n?' active':'');el.appendChild(p);}}
function gcd(a,b){while(b)[a,b]=[b,a%b];return Math.abs(a)}

function updateExplorer(){let d=+denSlider.value;numSlider.max=d;if(+numSlider.value>d)numSlider.value=d;let n=+numSlider.value;numValue.textContent=n;denValue.textContent=d;fractionLabel.textContent=`${n}/${d}`;renderBar('fractionBar',n,d);const g=gcd(n,d)||1;let msg=n===0?'Nilainya 0 karena tidak ada bagian yang dipilih.':n===d?'Semua bagian dipilih, jadi nilainya 1 utuh.':g>1?`${n}/${d} dapat disederhanakan menjadi ${n/g}/${d/g}.`:`Nilainya sekitar ${(n/d).toFixed(3).replace('.',',')}.`;fractionFeedback.textContent=msg;state.progress.explorer={n,d};saveLocal();}

function setMultiplier(m,btn){equivResult.textContent=`${2*m}/${3*m}`;document.querySelectorAll('#multiplierChoices button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');equivFeedback.textContent=`2/3 × ${m}/${m} = ${2*m}/${3*m}. Nilainya tetap 2/3 karena ${m}/${m}=1.`;}
function renderMultiplier(){for(let m=1;m<=5;m++){const b=document.createElement('button');b.textContent=`×${m}`;if(m===2)b.classList.add('active');b.onclick=()=>setMultiplier(m,b);multiplierChoices.appendChild(b);}}

function renderComparison(){leftFraction.textContent=`${comparison.aN}/${comparison.aD}`;rightFraction.textContent=`${comparison.bN}/${comparison.bD}`;renderBar('leftBar',comparison.aN,comparison.aD);renderBar('rightBar',comparison.bN,comparison.bD);compareSymbol.textContent='?';compareFeedback.textContent='Amati model visual lalu pilih hubungan kedua pecahan.';}
function compareCorrect(){const l=comparison.aN/comparison.aD,r=comparison.bN/comparison.bD;return Math.abs(l-r)<1e-9?'=':l>r?'>':'<'}
function checkComparison(choice){const c=compareCorrect();compareSymbol.textContent=c;const x=comparison.aN*comparison.bD,y=comparison.bN*comparison.aD;compareFeedback.textContent=choice===c?`Tepat. Perkalian silang menghasilkan ${x} ${c} ${y}.`:`Belum tepat. Coba perkalian silang: ${x} ${c} ${y}, sehingga jawabannya ${c}.`;}
function newComparison(){const i=comparisons[Math.floor(Math.random()*comparisons.length)];comparison={aN:i[0],aD:i[1],bN:i[2],bD:i[3]};renderComparison();}

function renderQuiz(){const q=quizData[quizIndex];quizSelection=null;quizChecked=false;quizCounter.textContent=`Soal ${quizIndex+1} dari ${quizData.length}`;quizScoreEl.textContent=`Skor: ${quizScore}`;quizQuestion.textContent=q.q;quizOptions.innerHTML='';q.o.forEach((txt,i)=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=`${String.fromCharCode(65+i)}. ${txt}`;b.onclick=()=>{if(quizChecked)return;quizSelection=i;document.querySelectorAll('.quiz-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')};quizOptions.appendChild(b)});quizFeedback.className='feedback hidden';checkQuizBtn.classList.remove('hidden');nextQuizBtn.classList.add('hidden');nextQuizBtn.textContent=quizIndex===quizData.length-1?'Lihat Hasil':'Soal Berikutnya';}
function checkQuiz(){if(quizSelection===null){quizFeedback.textContent='Pilih satu jawaban terlebih dahulu.';quizFeedback.className='feedback';return;}if(quizChecked)return;quizChecked=true;const q=quizData[quizIndex];document.querySelectorAll('.quiz-option').forEach((b,i)=>{if(i===q.a)b.classList.add('correct');if(i===quizSelection&&i!==q.a)b.classList.add('wrong')});const correct=quizSelection===q.a;if(correct)quizScore+=20;quizScoreEl.textContent=`Skor: ${quizScore}`;quizFeedback.textContent=(correct?'Benar. ':'Belum tepat. ')+q.e;quizFeedback.className='feedback';checkQuizBtn.classList.add('hidden');nextQuizBtn.classList.remove('hidden');}
function nextQuiz(){if(quizIndex<quizData.length-1){quizIndex++;renderQuiz()}else finishQuiz();}
async function finishQuiz(){quizArea.classList.add('hidden');quizResult.classList.remove('hidden');const msg=quizScore>=80?'Pemahaman konsep sudah kuat.':quizScore>=60?'Dasar konsep sudah terbentuk, tetapi masih perlu penguatan.':'Ulangi eksplorasi visual sebelum mencoba kuis lagi.';quizResult.innerHTML=`<h3>Skor Akhir: ${quizScore}/100</h3><p>${msg}</p><button class="btn primary" id="restartBtn">Ulangi Kuis</button>`;state.progress.quiz={score:quizScore,completedAt:new Date().toISOString()};saveLocal();await sync('saveQuiz',{score:quizScore,totalQuestions:quizData.length,answers:'formative-v1'});document.getElementById('restartBtn').onclick=()=>{quizIndex=0;quizScore=0;quizResult.classList.add('hidden');quizArea.classList.remove('hidden');renderQuiz()};}

function setupNav(){document.querySelectorAll('.tabs button').forEach(btn=>btn.onclick=()=>{document.getElementById(btn.dataset.target).scrollIntoView({behavior:'smooth'});document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');state.progress.lastModule=btn.dataset.target;saveLocal();sync('saveProgress',{module:btn.dataset.target,progressValue:1});});}

window.addEventListener('DOMContentLoaded',()=>{
 studentName.value=state.student.name||'';studentClass.value=state.student.className||'';
 saveIdentityBtn.onclick=async()=>{state.student={name:studentName.value.trim(),className:studentClass.value.trim()};saveLocal();await sync('saveStudent',{source:'github-pages'});};
 numSlider.oninput=updateExplorer;denSlider.oninput=updateExplorer;randomFractionBtn.onclick=()=>{denSlider.value=Math.floor(Math.random()*7)+3;numSlider.value=Math.floor(Math.random()*(+denSlider.value+1));updateExplorer()};
 renderMultiplier();renderComparison();document.querySelectorAll('.compareBtn').forEach(b=>b.onclick=()=>checkComparison(b.dataset.choice));newComparisonBtn.onclick=newComparison;
 window.quizScoreEl=document.getElementById('quizScore');checkQuizBtn.onclick=checkQuiz;nextQuizBtn.onclick=nextQuiz;renderQuiz();setupNav();updateExplorer();
 if(MPI_API.endpointReady()) setStatus(navigator.onLine?'Siap sinkron':'Offline, data akan diantrikan',navigator.onLine?'online':'');
 window.addEventListener('online',async()=>{const r=await MPI_API.flushQueue();setStatus(r.ok?'Sinkronisasi selesai':'Sebagian data masih tertunda',r.ok?'online':'error')});
});
