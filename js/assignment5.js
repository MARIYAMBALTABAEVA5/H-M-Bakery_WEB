// Assignment 5: DOM, events, callbacks, objects, arrays, loops, sounds and animations.
document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const feedback = $('#a5-feedback');
  const notify = (message) => { if (feedback) feedback.textContent = message; };
  // Objects with methods; array data; map() and filter() are higher-order functions.
  const products = [
    {name:'Chocolate Cake',category:'cakes',price:2500,image:'images/chocolate-cake.jpg'},
    {name:'Vanilla Cake',category:'cakes',price:2300,image:'images/vanilla-cake.jpg'},
    {name:'Cookies',category:'pastries',price:850,image:'images/cookies.jpg'},
    {name:'Croissant',category:'pastries',price:950,image:'images/croissant.jpg'},
    {name:'Latte',category:'drinks',price:1200,image:'images/latte.jpg'},
    {name:'Milkshake',category:'drinks',price:1500,image:'images/milkshake.jpg'},
    {name:'Banana Caramel Shake',category:'drinks',price:1600,image:'images/banana-caramel-shake.jpg'},
    {name:'Strawberry Milkshake',category:'drinks',price:1500,image:'images/milkshake-2.jpg'},
    {name:'Chocolate Shake',category:'drinks',price:1600,image:'images/milkshake.jpg'},
    {name:'Green Tea',category:'drinks',price:900,image:'images/green-tea.jpg'}
  ];
  // Cart is an object with methods; save items between page changes.
  const storageKey = 'hm-bakery-a5-cart';
  let stored = [];
  try { stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (_) { stored = []; }
  const cart = {
    items: Array.isArray(stored) ? stored.filter(item => products.some(p => p.name === item.name) && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 99) : [],
    add(product) { const line = this.items.find(item => item.name === product.name); if (line) line.qty = Math.min(99, line.qty + 1); else this.items.push({name: product.name, qty: 1}); this.save(); },
    change(name, delta) { const line = this.items.find(item => item.name === name); if (!line) return; line.qty += delta; if (line.qty <= 0) this.items = this.items.filter(item => item.name !== name); this.save(); },
    remove(name) { this.items = this.items.filter(item => item.name !== name); this.save(); },
    clear() { this.items = []; this.save(); },
    count() { return this.items.reduce((sum, item) => sum + item.qty, 0); },
    total() { return this.items.reduce((sum, item) => sum + products.find(p => p.name === item.name).price * item.qty, 0); },
    save() { try { localStorage.setItem(storageKey, JSON.stringify(this.items)); } catch (_) {} renderCart(); }
  };
  const money = value => `${value.toLocaleString('en-US')} ₸`;
  function renderCart() {
    const count = $('#a5-cart-count'); if (count) count.textContent = cart.count();
    const summary = $('#a5-cart'); if (summary) summary.textContent = `Cart: ${cart.count()} items · ${money(cart.total())}`;
    const lines = $('#a5-cart-lines'); if (!lines) return;
    lines.replaceChildren();
    if (!cart.items.length) { const empty = document.createElement('p'); empty.textContent = 'Your cart is empty. Add something delicious!'; lines.append(empty); }
    cart.items.forEach(item => {
      const product = products.find(p => p.name === item.name);
      const row = document.createElement('div'); row.className = 'a5-cart-line';
      const name = document.createElement('strong'); name.textContent = product.name;
      const price = document.createElement('span'); price.textContent = money(product.price * item.qty);
      const controls = document.createElement('div'); controls.className = 'a5-cart-controls';
      for (const [label, action, title] of [['−','minus','Decrease'],[String(item.qty),'none','Quantity'],['+','plus','Increase'],['Remove','remove','Remove']]) {
        if (action === 'none') { const qty = document.createElement('span'); qty.textContent = label; controls.append(qty); continue; }
        const button = document.createElement('button'); button.type = 'button'; button.className = 'a5-btn'; button.textContent = label;
        button.setAttribute('aria-label', `${title} ${product.name}`); button.dataset.action = action; button.dataset.product = product.name; controls.append(button);
      }
      row.append(name, price, controls); lines.append(row);
    });
    $('#a5-cart-total').textContent = `Total: ${money(cart.total())}`;
  }
  function addToCart(name, button) {
    const product = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!product) { notify(`Product ${name} is not available in the demo cart.`); return; }
    cart.add(product); playNotification(); notify(`${product.name} added to cart!`);
    const toast = $('#a5-toast'); if (toast) toast.textContent = `${product.name} added to cart!`;
    if (button) { button.classList.add('a5-pop'); setTimeout(() => button.classList.remove('a5-pop'), 350); }
  }
  renderCart();
  $('#a5-cart-toggle')?.addEventListener('click', () => {
    const drawer = $('#a5-cart-drawer'); drawer.hidden = !drawer.hidden;
    $('#a5-cart-toggle').setAttribute('aria-expanded', String(!drawer.hidden));
    if (!drawer.hidden) $('#a5-cart-close').focus();
  });
  $('#a5-cart-close')?.addEventListener('click', () => { $('#a5-cart-drawer').hidden = true; $('#a5-cart-toggle').setAttribute('aria-expanded', 'false'); $('#a5-cart-toggle').focus(); });
  $('#a5-cart-clear')?.addEventListener('click', () => cart.clear());
  $('#a5-cart-lines')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]'); if (!button) return;
    switch (button.dataset.action) { case 'plus': cart.change(button.dataset.product, 1); break; case 'minus': cart.change(button.dataset.product, -1); break; case 'remove': cart.remove(button.dataset.product); break; }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('#a5-cart-drawer') && !$('#a5-cart-drawer').hidden) $('#a5-cart-close').click(); });
  $$('.a5-order').forEach(button => button.addEventListener('click', () => addToCart(button.dataset.product, button)));
  // Interactive Hot / Cold / All drink filters on menu.html.
  const drinkCards = $$('#a5-drink-grid [data-drink-type]');
  $$('[data-drink-filter]').forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.drinkFilter;
    drinkCards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.drinkType !== selected; });
    $$('[data-drink-filter]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    const status = $('#a5-drink-status'); if (status) status.textContent = `Showing ${drinkCards.filter(card => !card.hidden).length} ${selected} drinks`;
  }));
  const cards = $('#a5-products');
  function playNotification(){
    try { const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;
      const ctx=new AudioContextClass();const osc=ctx.createOscillator();const gain=ctx.createGain();
      osc.type='sine';osc.frequency.value=660;gain.gain.setValueAtTime(.06,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);
      osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.17);
      osc.onended=()=>ctx.close();
    }catch(error){console.info('Sound unavailable',error);}
  }
  function renderProducts(category='all'){
    if(!cards)return;
    const visible=products.filter(p=>category==='all'||p.category===category);
    cards.innerHTML=visible.map((p)=>`<article class="a5-card"><img src="${p.image}" alt="${p.name}"><h3>${p.name}</h3><p>${p.price.toLocaleString()} ₸</p><button class="a5-btn a5-add" type="button" data-name="${p.name}">Add to cart</button></article>`).join('');
    $$('.a5-add').forEach(button => button.addEventListener('click', () => addToCart(button.dataset.name, button)));
  }
  renderProducts();
  $$('.a5-filter').forEach(button=>button.addEventListener('click',()=>{
    // Switch statement for category-dependent logic.
    let category;switch(button.dataset.category){case 'cakes':category='cakes';break;case 'pastries':category='pastries';break;case 'drinks':category='drinks';break;default:category='all';}
    $$('.a5-filter').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    renderProducts(category);notify(`Showing ${category} products.`);
  }));
  $('#a5-theme')?.addEventListener('click',()=>{const dark=document.body.classList.toggle('a5-night');$('#a5-theme').textContent=dark?'Light Mode':'Dark Mode';});
  $('#a5-more')?.addEventListener('click',()=>{const extra=$('#a5-extra');extra.hidden=!extra.hidden;$('#a5-more').textContent=extra.hidden?'Read More':'Read Less';});
  const stars=$$('.a5-star');stars.forEach((star,index)=>star.addEventListener('click',()=>{
    stars.forEach((s,i)=>{s.classList.toggle('selected',i<=index);s.setAttribute('aria-pressed',String(i<=index));});
    $('#a5-rating').textContent=`Your rating: ${index+1}/5`;playNotification();
  }));
  // Live Current Time
const clock = document.getElementById("a5-clock");
const timeButton = document.getElementById("a5-time");

function updateClock() {
    const now = new Date();

    clock.textContent = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

if (clock && timeButton) {
    timeButton.addEventListener("click", function () {
        updateClock();
        setInterval(updateClock, 1000);
        timeButton.disabled = true;
    });
}
  // Keyboard navigation on existing top navigation links.
  const nav=$$('.bakery-navbar .nav-link');nav.forEach((link,index)=>link.addEventListener('keydown',(event)=>{
    if(!['ArrowRight','ArrowLeft'].includes(event.key))return;
    event.preventDefault();const direction=event.key==='ArrowRight'?1:-1;
    nav[(index+direction+nav.length)%nav.length].focus();
  }));
  // A callback selects which form step is displayed.
  const steps=$$('.a5-step');let currentStep=0;
  function showStep(index,callback){steps.forEach((step,i)=>step.hidden=i!==index);currentStep=index;if(callback)callback(index);}
  const stepStatus=(index)=>{$('#a5-step-status').textContent=`Step ${index+1} of ${steps.length}`;};
  if (steps.length) showStep(0,stepStatus);
  $('#a5-next')?.addEventListener('click',()=>{
    const name=$('#a5-name').value.trim();const email=$('#a5-email').value.trim();
    if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){notify('Enter a name and valid email first.');return;}
    showStep(1,stepStatus);notify('Now enter your bakery request.');
  });
  $('#a5-back')?.addEventListener('click',()=>showStep(0,stepStatus));
  $('#a5-finish')?.addEventListener('click',()=>{
    if(!$('#a5-request').value.trim()){notify('Please enter your request.');return;}
    notify('Thank you! Your form passed the demo validation. No data was sent.');playNotification();
  });
});
