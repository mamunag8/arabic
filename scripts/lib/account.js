'use strict';

// Shared login/signup/profile/password modal -- used by every book AND the
// catalog home page, so the whole site shares one account. Written as its
// own real .js file on purpose: the account HTML/CSS/JS used to live inside
// build_site.js's own giant template literal, and every regex with a
// backslash in it (\s, \D, \+) silently lost the backslash because the OUTER
// template literal doesn't recognise those as escape sequences -- a real bug
// shipped to production more than once from that. A plain file has no outer
// literal to fight, so ordinary JS escaping just works.
//
// Pass `bookId` when embedding this in a book (scopes progress to that book,
// shows "X classes done", enables the finish-a-class login nudge). Omit it
// for the catalog: login/profile/password still work, progress bits disable
// themselves cleanly.
function accountModal({ bookId, supabaseAnonKey }) {
  const html = `
<div class="acct-modal" id="acctModal" hidden>
  <div class="acct-card" role="dialog" aria-modal="true" aria-labelledby="acctTitle">
    <button class="acct-x" id="acctClose" type="button" aria-label="বন্ধ করো">✕</button>
    <div id="acctGuest">
      <h2 id="acctTitle">অ্যাকাউন্ট</h2>
      <p class="muted">তোমার অগ্রগতি এমনিতেই এই ফোনে সেভ থাকে। অ্যাকাউন্ট বানালে অন্য ডিভাইস থেকেও চালিয়ে যেতে পারবে।</p>
      <form id="acctForm">
        <input type="text" id="acctEmail" placeholder="ইমেইল অথবা ফোন নম্বর" required autocomplete="username" inputmode="email">
        <p class="acct-hint">ফোন দিয়ে? লিখো: 01XXXXXXXXX (মোট ১১ সংখ্যা) — শুরুতে +880 আমরা নিজে থেকেই যোগ করব। অন্য দেশের নম্বর হলে নিজে দেশের কোডসহ লেখো, যেমন +8801XXXXXXXXX।</p>
        <input type="password" id="acctPass" placeholder="পাসওয়ার্ড" required autocomplete="current-password" minlength="6">
        <p class="acct-err" id="acctErr" hidden></p>
        <button class="btn" type="submit" id="acctSubmit">লগইন করো</button>
      </form>
      <p class="muted sm" id="acctToggleWrap">অ্যাকাউন্ট নেই? <button class="linklike" id="acctToggle" type="button">সাইন আপ করো</button></p>
      <p class="muted sm"><button class="linklike" id="acctForgotBtn" type="button">পাসওয়ার্ড ভুলে গেছো?</button></p>
      <p class="acct-err" id="acctForgotErr" hidden></p>
      <p class="acct-ok" id="acctForgotOk" hidden></p>
    </div>
    <div id="acctRecover" hidden>
      <h2>নতুন পাসওয়ার্ড দাও</h2>
      <p class="muted">ইমেইলের লিংকে ক্লিক করেছ। এবার নতুন পাসওয়ার্ড লেখো।</p>
      <form id="recForm">
        <input type="password" id="recNew" placeholder="নতুন পাসওয়ার্ড" required minlength="6" autocomplete="new-password">
        <input type="password" id="recConfirm" placeholder="আবার লেখো" required minlength="6" autocomplete="new-password">
        <p class="acct-err" id="recErr" hidden></p>
        <button class="btn" type="submit" id="recSubmit">পাসওয়ার্ড সেট করো</button>
      </form>
    </div>
    <div id="acctUser" hidden>
      <h2>তোমার প্রোফাইল</h2>
      <p><b id="acctUserEmail"></b></p>
      <p class="muted" id="acctDoneLine"><span id="acctUserDone">০</span>টি ক্লাস শেষ করেছ — এই অ্যাকাউন্টে সেভ হয়ে গেছে।</p>

      <form id="pfForm">
        <label class="acct-label">নাম <span class="acct-req">*</span><input type="text" id="pfName" required></label>
        <label class="acct-label">ফোন<input type="text" id="pfPhone" inputmode="tel" placeholder="01XXXXXXXXX"></label>
        <label class="acct-label">ইমেইল<input type="email" id="pfEmail"></label>
        <label class="acct-label">ঠিকানা<input type="text" id="pfAddress" placeholder="জেলা, উপজেলা"></label>
        <label class="acct-label">বয়স<input type="number" id="pfAge" min="1" max="100" inputmode="numeric"></label>
        <label class="acct-label">লিঙ্গ
          <select id="pfSex">
            <option value="">উল্লেখ করিনি</option>
            <option value="male">ছেলে</option>
            <option value="female">মেয়ে</option>
            <option value="other">অন্যান্য</option>
          </select>
        </label>
        <p class="acct-hint">নাম আবশ্যক। ফোন অথবা ইমেইলের অন্তত একটা লাগবে — বাকি সব ঐচ্ছিক।</p>
        <p class="acct-err" id="pfErr" hidden></p>
        <p class="acct-ok" id="pfOk" hidden>তথ্য সেভ হয়েছে।</p>
        <button class="btn" type="submit" id="pfSubmit">তথ্য সেভ করো</button>
      </form>

      <form id="pwForm">
        <h3>পাসওয়ার্ড বদলাও</h3>
        <input type="password" id="pwNew" placeholder="নতুন পাসওয়ার্ড" required minlength="6" autocomplete="new-password">
        <input type="password" id="pwConfirm" placeholder="আবার লেখো" required minlength="6" autocomplete="new-password">
        <p class="acct-err" id="pwErr" hidden></p>
        <p class="acct-ok" id="pwOk" hidden>পাসওয়ার্ড বদলে গেছে।</p>
        <button class="btn ghost" type="submit" id="pwSubmit">পাসওয়ার্ড বদলাও</button>
      </form>

      <button class="btn ghost" id="acctLogout" type="button">লগআউট</button>
    </div>
  </div>
</div>
`;

  const css = `
/* ---- account modal (optional cloud sync — never required to play) ---- */
/* the [hidden] rule must win over the plain-class display:flex below, or the
   browser's built-in "hidden means display:none" rule loses the cascade to
   this author rule and the modal stays visible even when JS sets .hidden --
   it would cover the entire page on every load, before anyone clicks the
   account button */
.acct-modal[hidden]{display:none}
/* align-items:flex-start (not center) + overflow-y on the modal itself is
   the load-bearing part: the profile view can get tall (demographic fields +
   password form + logout), and a centered flex item taller than the
   viewport clips off both top and bottom with no way to scroll to it --
   this keeps the top always reachable and lets the whole thing scroll. */
.acct-modal{position:fixed;inset:0;z-index:50;display:flex;align-items:flex-start;justify-content:center;
  background:color-mix(in srgb,#000 55%,transparent);padding:1.5rem 1rem;overflow-y:auto;
  -webkit-overflow-scrolling:touch}
.acct-card{background:var(--card);border:1px solid var(--line);border-radius:var(--rad);
  padding:1.5rem;max-width:22rem;width:100%;position:relative;margin:0 auto}
.acct-x{position:absolute;top:.3rem;right:.3rem;background:none;border:0;font-size:1.2rem;
  cursor:pointer;color:var(--mut);width:44px;height:44px;line-height:44px;text-align:center;
  padding:0;border-radius:9px}
.acct-x:active{background:var(--chip)}
.acct-card h2{margin-top:0;border:0;padding:0;font-size:1.25rem}
.acct-card input{display:block;width:100%;font:inherit;font-size:max(1rem,16px);padding:.65rem .9rem;
  border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);margin-bottom:.6rem}
.acct-card input:focus{outline:2px solid var(--acc);outline-offset:1px}
.acct-card form .btn{width:100%;border:0;font:inherit;font-size:1rem;cursor:pointer;margin-top:.2rem}
.acct-hint{color:var(--mut);font-size:.78rem;margin:-.4rem 0 .6rem;line-height:1.5}
.acct-err{color:#c0392b;font-size:.85rem;margin:.3rem 0}
.acct-ok{color:var(--acc);font-size:.85rem;margin:.3rem 0}
.acct-card select{display:block;width:100%;font:inherit;font-size:max(1rem,16px);padding:.65rem .9rem;
  border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);margin-bottom:.6rem}
.acct-label{display:block;font-size:.82rem;color:var(--mut);margin:.7rem 0 0}
.acct-label input,.acct-label select{margin-top:.3rem}
.acct-req{color:#c0392b}
#pfForm{margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)}
#pfForm .btn{margin-top:1rem}
#pwForm{margin-top:1rem;padding-top:1rem;border-top:1px solid var(--line)}
#pwForm h3{margin:0 0 .6rem;font-size:1rem;border:0;padding:0}
#pwForm .btn{margin-top:.3rem}
#acctLogout{display:block;margin:1.5rem auto 0}
.linklike{background:none;border:0;padding:0;color:var(--acc);text-decoration:underline;cursor:pointer;font:inherit}
.acct-nudge{background:var(--chip);border:1px solid var(--line);border-radius:var(--rad);
  padding:.8rem 1rem;margin:.8rem 0;font-size:.88rem;display:flex;gap:.6rem;align-items:center;
  justify-content:space-between;flex-wrap:wrap}
`;

  const bookIdLiteral = bookId ? JSON.stringify(bookId) : 'null';

  const js = `
// ---- account: shared login/profile/password (book: ${bookId || 'none — catalog'}) ----
(function(){
  var BOOK_ID = ${bookIdLiteral};
  var BN='০১২৩৪৫৬৭৮৯';
  function bn(x){ return String(x).replace(/[0-9]/g,function(d){return BN[+d];}); }

  // Progress is namespaced per book -- localStorage key and the nd_progress
  // table's book_id column both use BOOK_ID, so two books never collide and
  // the catalog (BOOK_ID===null) just never touches progress at all.
  var PKEY = BOOK_ID ? ('nd-progress-'+BOOK_ID) : null;
  function loadP(){ if(!PKEY) return {done:[]}; try{ return JSON.parse(localStorage.getItem(PKEY))||{done:[]}; }catch(e){ return {done:[]}; } }
  function saveP(p){ if(!PKEY) return; try{ localStorage.setItem(PKEY, JSON.stringify(p)); }catch(e){} }

  var modal=document.getElementById('acctModal');
  if(!modal) return;
  var acctBtn=document.getElementById('acctBtn');
  var closeBtn=document.getElementById('acctClose');
  var guestBox=document.getElementById('acctGuest');
  var userBox=document.getElementById('acctUser');
  var form=document.getElementById('acctForm');
  var emailInp=document.getElementById('acctEmail');
  var passInp=document.getElementById('acctPass');
  var errBox=document.getElementById('acctErr');
  var submitBtn=document.getElementById('acctSubmit');
  var toggleBtn=document.getElementById('acctToggle');
  var toggleWrap=document.getElementById('acctToggleWrap');
  var logoutBtn=document.getElementById('acctLogout');
  var userEmailEl=document.getElementById('acctUserEmail');
  var userDoneEl=document.getElementById('acctUserDone');
  var doneLineEl=document.getElementById('acctDoneLine');
  var pfForm=document.getElementById('pfForm');
  var pfName=document.getElementById('pfName');
  var pfPhone=document.getElementById('pfPhone');
  var pfEmail=document.getElementById('pfEmail');
  var pfAddress=document.getElementById('pfAddress');
  var pfAge=document.getElementById('pfAge');
  var pfSex=document.getElementById('pfSex');
  var pfErr=document.getElementById('pfErr');
  var pfOk=document.getElementById('pfOk');
  var pfSubmit=document.getElementById('pfSubmit');
  var forgotBtn=document.getElementById('acctForgotBtn');
  var forgotErr=document.getElementById('acctForgotErr');
  var forgotOk=document.getElementById('acctForgotOk');
  var pwForm=document.getElementById('pwForm');
  var pwNew=document.getElementById('pwNew');
  var pwConfirm=document.getElementById('pwConfirm');
  var pwErr=document.getElementById('pwErr');
  var pwOk=document.getElementById('pwOk');
  var pwSubmit=document.getElementById('pwSubmit');
  var recoverBox=document.getElementById('acctRecover');
  var recForm=document.getElementById('recForm');
  var recNew=document.getElementById('recNew');
  var recConfirm=document.getElementById('recConfirm');
  var recErr=document.getElementById('recErr');
  var recSubmit=document.getElementById('recSubmit');

  if(doneLineEl && !BOOK_ID) doneLineEl.hidden=true;

  var mode='login', supa=null, session=null, recoveryMode=false;

  function openModal(){ modal.hidden=false; }
  function closeModal(){ modal.hidden=true; if(errBox){errBox.hidden=true;} }
  if(acctBtn) acctBtn.addEventListener('click',openModal);
  if(closeBtn) closeBtn.addEventListener('click',closeModal);
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && !modal.hidden) closeModal(); });

  function paintAcctBtn(){
    if(!acctBtn) return;
    acctBtn.setAttribute('aria-label', session ? 'প্রোফাইল' : 'লগইন / প্রোফাইল');
    acctBtn.classList.toggle('is-in', !!session);
  }
  function paintModal(){
    if(!guestBox || !userBox) return;
    if(recoveryMode){
      guestBox.hidden=true; userBox.hidden=true;
      if(recoverBox) recoverBox.hidden=false;
      return;
    }
    if(recoverBox) recoverBox.hidden=true;
    if(session){
      guestBox.hidden=true; userBox.hidden=false;
      if(userEmailEl) userEmailEl.textContent = session.user.email || (session.user.phone ? '+'+session.user.phone : '');
      if(userDoneEl && BOOK_ID) userDoneEl.textContent = bn(loadP().done.length);
    } else {
      guestBox.hidden=false; userBox.hidden=true;
    }
  }
  function setMode(m){
    mode=m;
    if(submitBtn) submitBtn.textContent = m==='signup' ? 'সাইন আপ করো' : 'লগইন করো';
    if(toggleBtn) toggleBtn.textContent = m==='signup' ? 'লগইন করো' : 'সাইন আপ করো';
    if(toggleWrap && toggleWrap.firstChild) toggleWrap.firstChild.textContent = m==='signup' ? 'আগে থেকেই অ্যাকাউন্ট আছে? ' : 'অ্যাকাউন্ট নেই? ';
  }
  if(toggleBtn) toggleBtn.addEventListener('click',function(){ setMode(mode==='signup'?'login':'signup'); });
  function showErr(msg){ if(!errBox) return; errBox.textContent=msg; errBox.hidden=false; }

  function mergeDone(a,b){
    var seen={}; a.concat(b).forEach(function(n){ seen[n]=1; });
    return Object.keys(seen).map(Number).sort(function(x,y){ return x-y; });
  }

  // One box, email or phone -- same login either way. A Bangladeshi mobile
  // typed the way everyone actually types it (01XXXXXXXXX, 11 digits) gets
  // +880 stitched on automatically; anything already starting with + is
  // trusted as-is so other countries still work.
  function resolveIdentifier(raw){
    var v=String(raw||'').trim();
    if(v.indexOf('@')>-1) return {email:v};
    var digits=v.replace(/[\\s-]/g,'');
    if(digits.charAt(0)==='+') digits='+'+digits.slice(1).replace(/\\D/g,'');
    else digits=digits.replace(/\\D/g,'');
    if(/^01[0-9]{9}$/.test(digits)) return {phone:'+880'+digits.slice(1)};
    if(/^8801[0-9]{9}$/.test(digits)) return {phone:'+'+digits};
    if(/^\\+[1-9][0-9]{7,14}$/.test(digits)) return {phone:digits};
    return null;
  }

  function syncAfterLogin(){
    if(!supa || !session || !BOOK_ID) return Promise.resolve();
    return supa.from('nd_progress').select('done').eq('user_id',session.user.id).eq('book_id',BOOK_ID).single()
      .then(function(res){
        var remote = (res && res.data && res.data.done) || [];
        var merged = mergeDone(loadP().done, remote);
        saveP({done:merged});
        return supa.from('nd_progress').upsert({user_id:session.user.id, book_id:BOOK_ID, done:merged, updated_at:new Date().toISOString()});
      }).catch(function(){});
  }

  function pushProgress(){
    if(!supa || !session || !BOOK_ID) return;
    supa.from('nd_progress').upsert({
      user_id:session.user.id, book_id:BOOK_ID, done:loadP().done, updated_at:new Date().toISOString()
    }).catch(function(){});
  }
  window.__ndPushProgress = pushProgress;

  // Optional demographic details (edtech analysis / future planning) --
  // never blocks play, only offered once someone already has an account.
  // Name is required; phone or email (either can differ from the identifier
  // they actually logged in with) is required; everything else is optional.
  function loadProfileForm(){
    if(!supa || !session || !pfForm) return;
    supa.from('nd_profile').select('*').eq('user_id',session.user.id).single()
      .then(function(res){
        var p = res && res.data;
        pfName.value = (p && p.name) || '';
        pfPhone.value = (p && p.phone) || (session.user.phone ? '+'+session.user.phone : '');
        pfEmail.value = (p && p.email) || session.user.email || '';
        pfAddress.value = (p && p.address) || '';
        pfAge.value = (p && p.age) || '';
        pfSex.value = (p && p.sex) || '';
      }).catch(function(){});
  }

  // Reuses the same login-box phone parsing so "01XXXXXXXXX" typed here
  // normalises to +880... the same way, rather than needing its own rules.
  function normalizePhone(raw){
    var v=String(raw||'').trim();
    if(!v) return null;
    var id=resolveIdentifier(v);
    return (id && id.phone) ? id.phone : null;
  }

  // If a student signs up with just a phone (or just an email) and later
  // fills in the other one here, link it onto the SAME auth account instead
  // of leaving it as inert contact text -- so from then on either identifier
  // logs in with the one password they already set, instead of needing two
  // separate accounts. Phone changes apply immediately on this setup; email
  // changes go through Supabase's secure-email-change flow and sit
  // unconfirmed forever with no mail delivery configured here -- so this
  // checks what the server actually did rather than assuming success, and
  // the caller must never claim an email login works unless emailLinked is
  // true (emailPending means it silently did NOT take effect).
  function linkIdentifiers(normalizedPhone,email){
    if(!supa || !session) return Promise.resolve({phoneLinked:false,emailLinked:false,emailPending:false});
    var wantPhone = normalizedPhone && normalizedPhone.replace('+','')!==session.user.phone;
    var wantEmail = email && email!==session.user.email;
    var patch={};
    if(wantPhone) patch.phone=normalizedPhone;
    if(wantEmail) patch.email=email;
    if(!wantPhone && !wantEmail) return Promise.resolve({phoneLinked:false,emailLinked:false,emailPending:false});
    return supa.auth.updateUser(patch).then(function(res){
      if(res.error) throw res.error;
      var u = res.data && res.data.user;
      if(u) session=Object.assign({},session,{user:u});
      var phoneLinked = !!(wantPhone && u && u.phone===normalizedPhone.replace('+',''));
      var emailLinked = !!(wantEmail && u && u.email===email);
      return {phoneLinked:phoneLinked, emailLinked:emailLinked, emailPending: wantEmail && !emailLinked};
    });
  }

  if(pfForm) pfForm.addEventListener('submit',function(e){
    e.preventDefault();
    if(pfErr) pfErr.hidden=true;
    if(pfOk) pfOk.hidden=true;
    var name=pfName.value.trim(), phoneRaw=pfPhone.value.trim(), email=pfEmail.value.trim();
    if(!name){ pfErr.textContent='নাম লিখতে হবে।'; pfErr.hidden=false; return; }
    if(!phoneRaw && !email){ pfErr.textContent='ফোন অথবা ইমেইল, অন্তত একটা লিখতে হবে।'; pfErr.hidden=false; return; }
    var normalizedPhone = phoneRaw ? normalizePhone(phoneRaw) : null;
    if(phoneRaw && !normalizedPhone){ pfErr.textContent='ফোন নম্বরটা ঠিক নেই, এভাবে লেখো: 01XXXXXXXXX'; pfErr.hidden=false; return; }
    if(!supa || !session){ pfErr.textContent='একটু অপেক্ষা করো, লোড হচ্ছে…'; pfErr.hidden=false; return; }
    pfSubmit.disabled=true;
    supa.from('nd_profile').upsert({
      user_id:session.user.id,
      name:name,
      phone:normalizedPhone,
      email:email||null,
      address:pfAddress.value.trim()||null,
      age:pfAge.value?parseInt(pfAge.value,10):null,
      sex:pfSex.value||null,
      updated_at:new Date().toISOString()
    }).then(function(res){
      if(res.error) throw res.error;
      // A failure here means the identifier couldn't be linked (e.g. it
      // needs a confirmation this self-hosted setup can't deliver) -- the
      // profile data above already saved fine, so this must never surface
      // as a hard error, only a softer note inside the success message.
      return linkIdentifiers(normalizedPhone,email).catch(function(){ return {phoneLinked:false,emailLinked:false,emailPending:false,failed:true}; });
    }).then(function(link){
      var linkedWhat=[];
      if(link.phoneLinked) linkedWhat.push('ফোন');
      if(link.emailLinked) linkedWhat.push('ইমেইল');
      var msg='তথ্য সেভ হয়েছে।';
      if(linkedWhat.length) msg='তথ্য সেভ হয়েছে। এখন থেকে '+linkedWhat.join(' আর ')+' দিয়েও একই পাসওয়ার্ডে লগইন করা যাবে।';
      else if(link.emailPending) msg='তথ্য সেভ হয়েছে। (ইমেইল দিয়ে লগইন এখনই চালু করা গেল না — আগের নম্বর/ইমেইল দিয়েই লগইন করো।)';
      else if(link.failed) msg='তথ্য সেভ হয়েছে। (ফোন/ইমেইল যোগ করতে সমস্যা হয়েছে।)';
      pfOk.textContent=msg;
      pfOk.hidden=false;
      paintModal();
    }).catch(function(err){
      pfErr.textContent=(err && err.message) || 'সেভ করা যায়নি, আবার চেষ্টা করো।';
      pfErr.hidden=false;
    }).then(function(){
      pfSubmit.disabled=false;
    });
  });

  // Forgot password -- only works for email (sends a real reset link, needs
  // SMTP configured on Arabic_DB). Phone accounts have no SMS provider
  // configured here, so that path is told plainly rather than pretending.
  if(forgotBtn) forgotBtn.addEventListener('click',function(){
    if(forgotErr) forgotErr.hidden=true;
    if(forgotOk) forgotOk.hidden=true;
    var id=resolveIdentifier(emailInp.value);
    if(!id){ forgotErr.textContent='আগে উপরে ইমেইল অথবা ফোন নম্বর লেখো।'; forgotErr.hidden=false; return; }
    if(id.phone){ forgotErr.textContent='ফোন দিয়ে পাসওয়ার্ড রিসেট এখনো চালু নেই। ইমেইল থাকলে সেটা দিয়ে চেষ্টা করো।'; forgotErr.hidden=false; return; }
    if(!supa){ forgotErr.textContent='একটু অপেক্ষা করো, লোড হচ্ছে…'; forgotErr.hidden=false; return; }
    forgotBtn.disabled=true;
    supa.auth.resetPasswordForEmail(id.email,{redirectTo:location.origin+location.pathname}).then(function(res){
      if(res.error) throw res.error;
      forgotOk.textContent='রিসেট লিংক ইমেইলে পাঠানো হয়েছে। ইনবক্স (আর স্প্যাম ফোল্ডার) দেখো।';
      forgotOk.hidden=false;
    }).catch(function(err){
      forgotErr.textContent=(err && err.message) || 'পাঠানো যায়নি, আবার চেষ্টা করো।';
      forgotErr.hidden=false;
    }).then(function(){
      forgotBtn.disabled=false;
    });
  });

  // Change password while already signed in -- no "current password" field
  // needed, the active session itself is the proof of ownership.
  if(pwForm) pwForm.addEventListener('submit',function(e){
    e.preventDefault();
    if(pwErr) pwErr.hidden=true;
    if(pwOk) pwOk.hidden=true;
    var p1=pwNew.value, p2=pwConfirm.value;
    if(p1.length<6){ pwErr.textContent='পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।'; pwErr.hidden=false; return; }
    if(p1!==p2){ pwErr.textContent='দুইটা পাসওয়ার্ড মিলছে না।'; pwErr.hidden=false; return; }
    if(!supa || !session){ pwErr.textContent='একটু অপেক্ষা করো, লোড হচ্ছে…'; pwErr.hidden=false; return; }
    pwSubmit.disabled=true;
    supa.auth.updateUser({password:p1}).then(function(res){
      if(res.error) throw res.error;
      pwOk.hidden=false;
      pwForm.reset();
    }).catch(function(err){
      pwErr.textContent=(err && err.message) || 'বদলানো যায়নি, আবার চেষ্টা করো।';
      pwErr.hidden=false;
    }).then(function(){
      pwSubmit.disabled=false;
    });
  });

  // Landing from a password-reset email link -- supabase-js parses the
  // recovery token out of the URL on init and fires PASSWORD_RECOVERY
  // below, which is what actually opens this view (see onAuthStateChange).
  if(recForm) recForm.addEventListener('submit',function(e){
    e.preventDefault();
    if(recErr) recErr.hidden=true;
    var p1=recNew.value, p2=recConfirm.value;
    if(p1.length<6){ recErr.textContent='পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।'; recErr.hidden=false; return; }
    if(p1!==p2){ recErr.textContent='দুইটা পাসওয়ার্ড মিলছে না।'; recErr.hidden=false; return; }
    if(!supa){ recErr.textContent='একটু অপেক্ষা করো, লোড হচ্ছে…'; recErr.hidden=false; return; }
    recSubmit.disabled=true;
    supa.auth.updateUser({password:p1}).then(function(res){
      if(res.error) throw res.error;
      recoveryMode=false;
      try{ history.replaceState(null,'',location.pathname); }catch(e2){}
      paintAcctBtn(); paintModal(); loadProfileForm();
    }).catch(function(err){
      recErr.textContent=(err && err.message) || 'সেট করা যায়নি, আবার চেষ্টা করো।';
      recErr.hidden=false;
    }).then(function(){
      recSubmit.disabled=false;
    });
  });

  if(form) form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!supa){ showErr('একটু অপেক্ষা করো, লোড হচ্ছে…'); return; }
    if(errBox) errBox.hidden=true;
    var id=resolveIdentifier(emailInp.value);
    if(!id){ showErr('সঠিক ইমেইল লেখো, অথবা ফোন নম্বর লেখো এভাবে: 01XXXXXXXXX'); return; }
    if(submitBtn) submitBtn.disabled=true;
    var pass=passInp.value;
    var creds = id.email ? {email:id.email,password:pass} : {phone:id.phone,password:pass};
    var call = mode==='signup'
      ? supa.auth.signUp(creds)
      : supa.auth.signInWithPassword(creds);
    call.then(function(res){
      if(res.error) throw res.error;
      if(mode==='signup' && !res.data.session){
        showErr('অ্যাকাউন্ট তৈরি হয়েছে! এখন লগইন করো।');
        setMode('login');
        return;
      }
      session = res.data.session;
      return syncAfterLogin().then(function(){
        paintAcctBtn(); paintModal(); closeModal();
        location.reload();
      });
    }).catch(function(err){
      showErr((err && err.message) || 'কিছু ভুল হয়েছে, আবার চেষ্টা করো।');
    }).then(function(){
      if(submitBtn) submitBtn.disabled=false;
    });
  });

  if(logoutBtn) logoutBtn.addEventListener('click',function(){
    if(supa) supa.auth.signOut().catch(function(){});
    session=null;
    paintAcctBtn(); paintModal(); closeModal();
  });

  window.__ndMaybeNudge = function(){
    if(!BOOK_ID) return;
    if(session) return;
    if(loadP().done.length<1) return;
    if(document.querySelector('.acct-nudge')) return;
    var host = document.querySelector('.done-msg') || document.querySelector('.q-note');
    if(!host) return;
    var n=document.createElement('div');
    n.className='acct-nudge';
    var span=document.createElement('span');
    span.textContent='তোমার প্রোগ্রেস সেভ করে রাখো — অন্য ফোন থেকেও চালিয়ে যেতে পারবে।';
    var b=document.createElement('button');
    b.className='btn ghost mini'; b.type='button'; b.textContent='অ্যাকাউন্ট বানাও';
    b.addEventListener('click',openModal);
    n.appendChild(span); n.appendChild(b);
    host.parentNode.insertBefore(n, host.nextSibling);
  };

  setMode('login');

  // Loaded from a CDN on purpose -- this project ships with no bundler, so
  // this is the zero-build way to bring in supabase-js. If the CDN is
  // unreachable everything above still works; only the optional sync layer
  // stays inactive.
  import('https://esm.sh/@supabase/supabase-js@2').then(function(mod){
    supa = mod.createClient(location.origin + '/supabase', '${supabaseAnonKey}');
    return supa.auth.getSession();
  }).then(function(res){
    session = (res && res.data) ? res.data.session : null;
    var after = session ? syncAfterLogin() : Promise.resolve();
    after.then(function(){
      paintAcctBtn(); paintModal(); loadProfileForm(); window.__ndMaybeNudge();
    });
    supa.auth.onAuthStateChange(function(_evt,s){
      session=s;
      if(_evt==='PASSWORD_RECOVERY'){ recoveryMode=true; openModal(); }
      paintAcctBtn(); paintModal(); loadProfileForm();
    });
  }).catch(function(){
    window.__ndMaybeNudge();
  });
})();
`;

  return { html, css, js };
}

module.exports = { accountModal };
