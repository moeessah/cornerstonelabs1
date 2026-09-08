// ── NAV: solid on scroll ─────────────────────────
(function(){
  var nav = document.getElementById('mainNav');
  if(!nav) return;
  function onScroll(){
    if(window.scrollY > 8) nav.classList.add('solid');
    else nav.classList.remove('solid');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});
})();

// ── NAV: mobile menu toggle ──────────────────────
(function(){
  var menu = document.querySelector('.nav-menu');
  var trigger = document.querySelector('.nav-menu-trigger');
  if(!menu || !trigger) return;
  trigger.addEventListener('click', function(){
    var open = menu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', function(e){
    if(!menu.contains(e.target)) menu.classList.remove('open');
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){ menu.classList.remove('open'); });
  });
})();

// ── NAV: build dropdown menu from every section + track current section ──
(function(){
  var sections = [].slice.call(document.querySelectorAll('section[data-nav-label]'));
  var panel = document.getElementById('navMenuPanel');
  var nowReading = document.getElementById('nowReading');
  var nav = document.getElementById('mainNav');
  if(!sections.length) return;

  // auto-populate the dropdown so it always lists every section, in document order
  if(panel){
    panel.innerHTML = sections.map(function(s){
      return '<a href="#' + s.id + '">' + s.getAttribute('data-nav-label') + '</a>';
    }).join('');
  }

  var links = document.querySelectorAll('.nav-links a, .nav-menu-panel a');

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id = entry.target.id;
        var label = entry.target.getAttribute('data-nav-label');
        links.forEach(function(l){
          var match = l.getAttribute('href') === '#' + id;
          l.classList.toggle('active', match);
        });
        if(nowReading){
          if(id === 'top'){
            nowReading.classList.remove('show');
          } else {
            nowReading.textContent = label;
            nowReading.classList.add('show');
          }
        }
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  sections.forEach(function(s){ io.observe(s); });
})();

// ── REVEAL ON SCROLL ──────────────────────────────
(function(){
  var targets = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
  if(!targets.length) return;
  var io = new IntersectionObserver(function(entries, obs){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:.12, rootMargin:'0px 0px -60px 0px'});
  targets.forEach(function(t){ io.observe(t); });
})();

// ── KEYWORD HIGHLIGHT ON SCROLL ───────────────────
(function(){
  var hls = document.querySelectorAll('.hl');
  if(!hls.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting) entry.target.classList.add('lit');
    });
  }, {threshold:.6});
  hls.forEach(function(h){ io.observe(h); });
})();

// ── DISCIPLINES: pinned stacking cards — shrink as covered ──
// Each card sits in its own sticky shell. As the next shell's sticky
// card approaches the same pinned position, the current card scales
// down slightly and dims, simulating it being pressed back in the stack.
(function(){
  var shells = [].slice.call(document.querySelectorAll('[data-stack-shell]'));
  if(!shells.length) return;
  var STICK_TOP = 104;

  function onScroll(){
    for(var i = 0; i < shells.length; i++){
      var shell = shells[i];
      var card = shell.querySelector('.stack-card');
      var next = shells[i+1];
      if(!card) continue;

      if(!next){
        card.style.transform = 'none';
        card.style.opacity = '1';
        continue;
      }
      var nextRect = next.getBoundingClientRect();
      // distance between this card's pinned top and the next shell's current top
      // shrinks toward 0 as the next card approaches/covers this one
      var gap = nextRect.top - STICK_TOP;
      var shellHeight = shell.offsetHeight || 1;
      var progress = 1 - Math.max(0, Math.min(1, gap / shellHeight));
      var scale = 1 - progress * 0.16;
      var opacity = 1 - progress * 0.55;
      card.style.transform = 'scale(' + scale.toFixed(3) + ')';
      card.style.opacity = opacity.toFixed(2);
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// ── METHODOLOGY: scroll-scrubbed rail ─────────────
(function(){
  var wrap = document.getElementById('railWrap');
  var fill = document.getElementById('railFill');
  var dot = document.getElementById('railDot');
  var stageOf = document.getElementById('railStageOf');
  var stages = wrap ? [].slice.call(wrap.querySelectorAll('[data-rail-stage]')) : [];
  if(!wrap || !fill || !dot || !stages.length) return;

  var total = stages.length;

  function onScroll(){
    var rect = wrap.getBoundingClientRect();
    var wrapHeight = wrap.offsetHeight;
    var viewportMid = window.innerHeight * 0.42;
    var progress = (viewportMid - rect.top) / Math.max(1, (wrapHeight - 1));
    progress = Math.max(0, Math.min(1, progress));

    var trackHeight = fill.parentElement.offsetHeight;
    fill.style.height = (progress * 100) + '%';
    dot.style.top = (progress * trackHeight) + 'px';

    var activeIdx = 0;
    var activeColor = '#5A4FCF';
    stages.forEach(function(stage, i){
      var sRect = stage.getBoundingClientRect();
      var active = sRect.top < viewportMid && sRect.bottom > viewportMid;
      stage.classList.toggle('is-active', active);
      if(active){
        activeIdx = i;
        activeColor = stage.getAttribute('data-stage-color') || activeColor;
      }
    });

    fill.style.background = activeColor;
    dot.style.background = activeColor;
    stageOf.style.color = activeColor;
    stageOf.textContent = 'Stage ' + String(activeIdx+1).padStart(2,'0') + ' of ' + String(total).padStart(2,'0');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// ── FOUNDER: colour-shifting timeline rail ────────
(function(){
  var wrap = document.getElementById('founderRailWrap');
  var fill = document.getElementById('founderRailFill');
  var dot = document.getElementById('founderRailDot');
  var marks = wrap ? [].slice.call(wrap.querySelectorAll('[data-founder-mark]')) : [];
  if(!wrap || !fill || !dot || !marks.length) return;

  function onScroll(){
    var rect = wrap.getBoundingClientRect();
    var wrapHeight = wrap.offsetHeight;
    var viewportMid = window.innerHeight * 0.45;
    var progress = (viewportMid - rect.top) / Math.max(1, (wrapHeight - 1));
    progress = Math.max(0, Math.min(1, progress));

    fill.style.height = (progress * 100) + '%';
    dot.style.top = (progress * wrapHeight) + 'px';

    var activeColor = '#5A4FCF';
    marks.forEach(function(mark){
      var mRect = mark.getBoundingClientRect();
      var active = mRect.top < viewportMid && mRect.bottom > viewportMid;
      mark.classList.toggle('is-active', active);
      if(active) activeColor = mark.getAttribute('data-mark-color') || activeColor;
    });
    fill.style.background = activeColor;
    dot.style.background = activeColor;
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// ── DECISION RECORD: tab switcher ─────────────────
(function(){
  var tabs = document.querySelectorAll('.fdoc-tab');
  var docSample = document.getElementById('docSample');
  var docReal = document.getElementById('docReal');
  if(!tabs.length || !docSample || !docReal) return;
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabs.forEach(function(b){
        b.classList.remove('active');
        b.setAttribute('aria-selected','false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      if(btn.dataset.doc === 'real'){
        docSample.classList.add('fdoc--hidden');
        docReal.classList.remove('fdoc--hidden');
      } else {
        docReal.classList.add('fdoc--hidden');
        docSample.classList.remove('fdoc--hidden');
      }
    });
  });
})();

// ── CASES: claim-type tab data + switcher ─────────
window.caseData = {
  pricing: {
    type: 'Pricing',
    title: 'A price increase will hold if the product is good enough.',
    copy: 'Product quality and price tolerance are different claims. Evidence shows tolerance tracks switching cost, not satisfaction. Happy customers leave over price all the time, if leaving is easy.',
    weak: 'No measure yet of how costly it actually is for a customer to walk, beyond a general sense that they like the product.',
    test: 'Run the increase against new accounts first, where there is no incumbent relationship to protect. The renewal base is a separate, riskier claim.'
  },
  launch: {
    type: 'Market entry',
    title: 'Being early creates advantage.',
    copy: 'Early entry only wins when distribution is still open. The evidence splits sharply here. It depends entirely on whether the category definer controls distribution at the moment you enter.',
    weak: 'No assessment yet exists of who controls distribution in this category, or how fast that could change.',
    test: "Map the category's current distribution control before committing a launch date. If it's contested, timing risk is lower than assumed."
  },
  campaign: {
    type: 'Positioning',
    title: 'The story will carry the launch on its own.',
    copy: 'A strong story buys attention, not adoption. Precedent shows stories that outpace the actual product experience generate a short spike followed by a longer credibility drag than launching quietly would have.',
    weak: 'No check on whether the product, today, can deliver on the claim the campaign is about to make publicly.',
    test: 'Test the claim against the current product with five real users before the campaign goes out.'
  },
  roadmap: {
    type: 'Coalition',
    title: 'Shared interest is enough to hold a coalition together.',
    copy: "Shared interest gets a coalition to the table. It rarely keeps it there once cost-sharing decisions start. Historical pattern shows coalitions hold when there's a named mechanism for resolving disagreement.",
    weak: 'No documented process for what happens when two members disagree on resource allocation.',
    test: 'Write the disagreement-resolution mechanism before the next funding round.'
  },
  ai: {
    type: 'AI strategy',
    title: 'This AI capability will compound our competitive advantage.',
    copy: 'Precedent on technology-as-moat splits on one question: is the capability actually scarce? When the underlying infrastructure is available to every competitor at the same price, operational efficiency gains distribute evenly across the market. The advantage disappears before it compounds.',
    weak: 'No assessment of whether this capability is proprietary or whether every competitor has access to the same underlying model, the same API, the same output.',
    test: "Map who else is running on the same infrastructure. If the answer is most of your category, the advantage is real but temporary, and the window to build something proprietary on top of it is the only question that matters."
  }
};

(function(){
  var tabs = document.querySelectorAll('.ctab');
  var typeEl = document.getElementById('caseType');
  var titleEl = document.getElementById('caseTitle');
  var copyEl = document.getElementById('caseCopy');
  var weakEl = document.getElementById('caseWeak');
  var testEl = document.getElementById('caseTest');
  if(!tabs.length) return;
  tabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      tabs.forEach(function(b){
        b.classList.remove('active');
        b.setAttribute('aria-selected','false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      var data = window.caseData[btn.dataset.case];
      if(!data) return;
      typeEl.textContent = data.type;
      titleEl.textContent = data.title;
      copyEl.textContent = data.copy;
      weakEl.textContent = data.weak;
      testEl.textContent = data.test;
    });
  });
})();

// ── INVESTORS: carousel arrows + dots ─────────────
(function(){
  var carousel = document.getElementById('investorsCarousel');
  var prev = document.getElementById('invPrev');
  var next = document.getElementById('invNext');
  var dotsWrap = document.getElementById('invDots');
  if(!carousel || !prev || !next || !dotsWrap) return;

  var cards = [].slice.call(carousel.children);
  var dots = [];

  function cardWidth(){
    return cards[0] ? cards[0].getBoundingClientRect().width + 20 : 300;
  }

  // Number of dots = number of actual reachable scroll positions,
  // not one per card (cards-per-view means far fewer real "pages" exist).
  function pageCount(){
    var maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if(maxScroll <= 0) return 1;
    return Math.round(maxScroll / cardWidth()) + 1;
  }

  function buildDots(){
    var n = pageCount();
    dotsWrap.innerHTML = Array.from({length:n}, function(_, i){
      return '<span data-dot="'+i+'"></span>';
    }).join('');
    dots = [].slice.call(dotsWrap.children);
    dots.forEach(function(d,i){
      d.addEventListener('click', function(){
        var maxScroll = carousel.scrollWidth - carousel.clientWidth;
        var n = pageCount();
        var target = (n <= 1) ? 0 : Math.round(i * (maxScroll / (n - 1)));
        carousel.scrollTo({left:target, behavior:'smooth'});
      });
    });
  }

  function updateDots(){
    var maxScroll = carousel.scrollWidth - carousel.clientWidth;
    var n = pageCount();
    var idx;
    if(maxScroll <= 0 || n <= 1){
      idx = 0;
    } else if(carousel.scrollLeft >= maxScroll - 4){
      idx = n - 1;
    } else {
      idx = Math.round(carousel.scrollLeft / (maxScroll / (n - 1)));
    }
    dots.forEach(function(d,i){ d.classList.toggle('active', i === idx); });
  }
  prev.addEventListener('click', function(){
    carousel.scrollBy({left:-cardWidth(), behavior:'smooth'});
  });
  next.addEventListener('click', function(){
    carousel.scrollBy({left:cardWidth(), behavior:'smooth'});
  });
  buildDots();
  carousel.addEventListener('scroll', function(){
    window.requestAnimationFrame(updateDots);
  }, {passive:true});
  window.addEventListener('resize', function(){
    buildDots();
    updateDots();
  });
  updateDots();
})();

// ── INTAKE FORM: scope warning + submit ───────────
(function(){
  var select = document.getElementById('decisionType');
  var warn = document.getElementById('scopeWarning');
  if(select && warn){
    select.addEventListener('change', function(){
      warn.classList.toggle('show', select.value === 'Other');
    });
  }
  var form = document.getElementById('intakeForm');
  var success = document.getElementById('successState');
  if(form && success){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      form.style.display = 'none';
      success.classList.add('show');
    });
  }
})();
