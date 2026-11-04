import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

const index=await readFile(new URL('../prototype/index.html',import.meta.url),'utf8');
const script=await readFile(new URL('../prototype/liquid-glass.js',import.meta.url),'utf8');
const css=await readFile(new URL('../prototype/liquid-glass.css',import.meta.url),'utf8');

function createStudio(reduced=false){
  const dom=new JSDOM('<!doctype html><nav class="side-nav"><button class="nav-item" id="item">Articles</button></nav>',{
    url:'https://cms.example.invalid/prototype/',runScripts:'outside-only'
  });
  dom.window.PointerEvent=dom.window.MouseEvent;
  dom.window.matchMedia=query=>({matches:query.includes('prefers-reduced-motion')&&reduced});
  dom.window.eval(script);
  const item=dom.window.document.querySelector('#item');
  item.getBoundingClientRect=()=>({left:10,top:20,width:200,height:50});
  return {dom,item};
}

test('Studio loads the Liquid Glass assets after the base styles',()=>{
  assert.match(index,/liquid-glass\.css\?v=20261104-liquid1/);
  assert.match(index,/liquid-glass\.js\?v=20261104-liquid1/);
  assert.ok(index.indexOf('studio-polish.css')<index.indexOf('liquid-glass.css'));
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/pointer:coarse/);
});

test('pointer light tracks the cursor position in a navigation control',()=>{
  const {dom,item}=createStudio();
  try{
    item.dispatchEvent(new dom.window.MouseEvent('pointermove',{
      bubbles:true,clientX:60,clientY:45
    }));
    assert.equal(item.style.getPropertyValue('--lg-x'),'25.0%');
    assert.equal(item.style.getPropertyValue('--lg-y'),'50.0%');
  }finally{dom.window.close();}
});

test('pointer positions are clamped to control boundaries',()=>{
  const {dom,item}=createStudio();
  try{
    item.dispatchEvent(new dom.window.MouseEvent('pointerdown',{
      bubbles:true,clientX:999,clientY:-15
    }));
    assert.equal(item.style.getPropertyValue('--lg-x'),'100.0%');
    assert.equal(item.style.getPropertyValue('--lg-y'),'0.0%');
  }finally{dom.window.close();}
});

test('reduced-motion preference disables pointer-driven animation',()=>{
  const {dom,item}=createStudio(true);
  try{
    item.dispatchEvent(new dom.window.MouseEvent('pointermove',{
      bubbles:true,clientX:60,clientY:45
    }));
    assert.equal(item.style.getPropertyValue('--lg-x'),'');
  }finally{dom.window.close();}
});
