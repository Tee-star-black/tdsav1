(function(){
  'use strict';
  var search=document.querySelector('#blogSearch');
  var count=document.querySelector('#blogResultCount');
  var cards=Array.prototype.slice.call(document.querySelectorAll('.blog-card'));
  var buttons=Array.prototype.slice.call(document.querySelectorAll('[data-blog-category]'));
  if(!search||!cards.length)return;
  var active='all';
  function apply(){
    var query=search.value.trim().toLowerCase();
    var visible=0;
    cards.forEach(function(card){
      var text=(card.getAttribute('data-search')||'').toLowerCase();
      var category=card.getAttribute('data-category')||'';
      var show=(!query||text.indexOf(query)!==-1)&&(active==='all'||category===active);
      card.hidden=!show;if(show)visible++;
    });
    if(count)count.textContent=visible+' '+(visible===1?'story':'stories');
  }
  search.addEventListener('input',apply);
  buttons.forEach(function(button){button.addEventListener('click',function(){active=button.getAttribute('data-blog-category')||'all';buttons.forEach(function(item){item.classList.toggle('active',item===button);});apply();});});
  apply();
})();
