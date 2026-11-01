(async () => {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  const EASE = 'expo.out';
  const SIDEWAYS_SCROLL_SHARE = 0.55; // the gallery travels faster than the scroll, so it never drags
  const DRAW_LENGTH = 1000; // matches pathLength in index.html; GSAP rounds px values, so a small length would jump
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => gsap.utils.toArray(selector);

  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = new Lenis({ lerp: 0.09, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // SplitText measures glyphs, so wait for the fonts, but never hold the page for them
  await Promise.race([document.fonts.ready, new Promise((done) => setTimeout(done, 1500))]);

  function intro() {
    const { chars } = SplitText.create('h1', { type: 'chars', charsClass: 'char' });
    gsap.timeline()
      .set('.curtain', { animation: 'none' })
      .to('.curtain', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' })
      .set('.curtain', { display: 'none' })
      .fromTo(chars, { '--w': 50, yPercent: 60, opacity: 0 },
        { '--w': 150, yPercent: 0, opacity: 1, duration: 1.3, ease: EASE, stagger: 0.04 }, 0.45)
      .from('.role, .lede', { y: 16, opacity: 0, filter: 'blur(4px)', duration: 0.8, ease: EASE, stagger: 0.12 }, 1)
      .from('.hero-set', { y: 90, opacity: 0, duration: 1.3, ease: EASE }, 0.9);
    return chars;
  }

  function chrome() {
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: ({ direction, scroll }) => $('.top').classList.toggle('is-away', direction === 1 && scroll() > 240),
    });
  }

  function heroScroll() {
    const scrollTrigger = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 };
    gsap.fromTo('h1', { '--g': 900 }, { '--g': 500, ease: 'none', scrollTrigger }); // the name thins out as you leave
    gsap.to('.marquee p', {
      x: () => -$('.marquee p').offsetWidth * 0.4,
      ease: 'none',
      scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true },
    });
  }

  function textReveals() {
    $$('.rise').forEach((el) => SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit: ({ lines }) => gsap.from(lines, {
        yPercent: 110,
        duration: 1,
        ease: EASE,
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }),
    }));
    gsap.set('.reveal', { y: 14, opacity: 0, filter: 'blur(4px)' });
    ScrollTrigger.batch('.reveal', {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: EASE, stagger: 0.05 }),
    });
  }

  function parks(wide) {
    if (wide) {
      // The site starts close up, then pulls back until the whole plan is visible
      // while its boundary path draws itself and each play structure gets circled as the path passes
      gsap.timeline({
        scrollTrigger: { trigger: '.plan', start: 'top top', end: '+=110%', pin: true, scrub: 0.8 },
      })
        .fromTo('.plan-art', { scale: 2.1, transformOrigin: '30% 55%' }, { scale: 1, ease: 'power1.inOut', duration: 1 }, 0)
        .from('.plan-route', { strokeDashoffset: DRAW_LENGTH, ease: 'none', duration: 1 }, 0)
        .from('.plan-spot', { strokeDashoffset: DRAW_LENGTH, ease: 'none', duration: 0.1, stagger: 0.14 }, 0.12);
    } else {
      gsap.timeline({
        scrollTrigger: { trigger: '.plan', start: 'top 90%', end: 'center 40%', scrub: 0.6 },
      })
        .from('.plan-art', { clipPath: 'inset(0 50% 0 50%)', ease: 'none', duration: 0.5 }, 0)
        .from('.plan-route', { strokeDashoffset: DRAW_LENGTH, ease: 'none', duration: 1 }, 0)
        .from('.plan-spot', { strokeDashoffset: DRAW_LENGTH, ease: 'none', duration: 0.1, stagger: 0.14 }, 0.12);
    }
    gsap.fromTo('.drift img', { yPercent: 7 }, {
      yPercent: -7,
      ease: 'none',
      scrollTrigger: { trigger: '.drift', start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  }

  function equipment() {
    gsap.fromTo('.stretch', { '--w': 58 }, {
      '--w': 150,
      ease: 'none',
      scrollTrigger: { trigger: '.stretch', start: 'top 95%', end: 'top 35%', scrub: 0.6 },
    });
    gsap.fromTo('.equipment-set', { y: 80, scale: 0.92 }, {
      y: 0,
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.equipment-set', start: 'top bottom', end: 'center center', scrub: 0.6 },
    });
    gsap.timeline({ scrollTrigger: { trigger: '.equipment-set', start: 'top 35%', once: true } })
      .from('.callout-line', { strokeDashoffset: DRAW_LENGTH, duration: 0.5, ease: 'power2.out', stagger: 0.1 })
      .from('.callout', { opacity: 0, duration: 0.4, ease: 'power2.out', stagger: 0.1 }, 0.25);
  }

  function rooms(wide) {
    const frames = $$('.frame');
    if (!wide) {
      frames.forEach((frame) => gsap.from(frame, {
        clipPath: 'inset(14% 8% 14% 8%)',
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'top 55%', scrub: 0.5 },
      }));
      return undefined;
    }
    const section = $('.rooms');
    const track = $('.track');
    section.classList.add('is-sideways');
    const distance = () => track.scrollWidth - window.innerWidth;
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none', // containerAnimation needs a 1:1 mapping
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${distance() * SIDEWAYS_SCROLL_SHARE}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    frames.forEach((frame) => gsap.fromTo(frame.querySelector('img'), { xPercent: -12 }, {
      xPercent: 0,
      ease: 'none',
      scrollTrigger: { containerAnimation: slide, trigger: frame, start: 'left right', end: 'right left', scrub: true },
    }));
    // The track moves by transform, so the browser can't scroll a tabbed-to thumbnail into view by itself
    const showFocused = ({ target }) => {
      if (!target.matches(':focus-visible')) return;
      const { start, end } = slide.scrollTrigger;
      const frame = target.getBoundingClientRect();
      const travel = frame.left - track.getBoundingClientRect().left - (window.innerWidth - frame.width) / 2;
      lenis.scrollTo(start + gsap.utils.clamp(0, 1, travel / distance()) * (end - start));
    };
    track.addEventListener('focusin', showFocused);
    return () => {
      track.removeEventListener('focusin', showFocused);
      section.classList.remove('is-sideways');
    };
  }

  function otherWork() {
    gsap.fromTo('.edge-line', { clipPath: 'inset(-20px 100% -20px 0)' }, {
      clipPath: 'inset(-20px 0% -20px 0)',
      ease: 'none',
      scrollTrigger: { trigger: '.edge', start: 'top 95%', end: 'bottom 45%', scrub: 0.6 },
    });
    gsap.from('.book', {
      y: 48,
      opacity: 0,
      duration: 0.8,
      ease: EASE,
      stagger: 0.05,
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.shelf', start: 'top 85%', once: true },
    });
    gsap.fromTo('.timeline', { '--fill': 0 }, {
      '--fill': 1,
      ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 },
    });
  }

  function contact() {
    SplitText.create('.wave', {
      type: 'words,chars',
      charsClass: 'char',
      autoSplit: true,
      onSplit: ({ chars }) => gsap.fromTo(chars, { '--w': 50, opacity: 0.25 }, {
        '--w': 110,
        opacity: 1,
        duration: 1,
        ease: EASE,
        stagger: 0.015,
        scrollTrigger: { trigger: '.wave', start: 'top 85%', once: true },
      }),
    });
  }

  // Letters in the name narrow toward the pointer, then spring back
  function nameFollowsPointer(chars) {
    const FALLOFF = 260;
    const onMove = ({ clientX, clientY }) => {
      chars.forEach((char) => {
        const box = char.getBoundingClientRect();
        const distance = Math.hypot(clientX - (box.left + box.width / 2), clientY - (box.top + box.height / 2));
        const pull = Math.max(0, 1 - distance / FALLOFF);
        gsap.to(char, { '--w': 150 - pull * 90, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      });
    };
    const hero = $('.hero');
    const onLeave = () => gsap.to(chars, { '--w': 150, duration: 0.8, ease: 'elastic.out(1, .6)', overwrite: 'auto' });
    gsap.delayedCall(2, () => {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
    });
    return () => {
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }

  function magneticMail() {
    const mail = $('.mail');
    const x = gsap.quickTo(mail, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(mail, 'y', { duration: 0.5, ease: 'power3.out' });
    const onMove = ({ clientX, clientY }) => {
      const box = mail.getBoundingClientRect();
      x((clientX - box.left - box.width / 2) * 0.12);
      y((clientY - box.top - box.height / 2) * 0.25);
    };
    const onLeave = () => { x(0); y(0); };
    mail.addEventListener('pointermove', onMove);
    mail.addEventListener('pointerleave', onLeave);
    return () => {
      mail.removeEventListener('pointermove', onMove);
      mail.removeEventListener('pointerleave', onLeave);
    };
  }

  function lightbox() {
    const SWIPE_DISTANCE = 50;
    const VEIL = 0.95;
    const dialog = $('.lightbox');
    const big = dialog.querySelector('img');
    const count = $('.lightbox-count');
    const announcer = $('.lightbox-status');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const images = $$('.frame img');
    let current = 0;
    let openedAt = 0;
    let opener = null;
    let swipeStart = 0;

    const show = (index) => {
      current = (index + images.length) % images.length;
      big.src = images[current].currentSrc || images[current].src;
      big.alt = images[current].alt;
      count.textContent = `${current + 1} of ${images.length}`;
      announcer.textContent = `${count.textContent}: ${big.alt}`;
      return big.decode().catch(() => {}); // a broken image still has to open
    };

    // The transform that puts the enlarged image over its thumbnail
    const overThumbnail = () => {
      const thumb = opener.getBoundingClientRect();
      const box = big.getBoundingClientRect();
      return {
        x: thumb.left + thumb.width / 2 - (box.left + box.width / 2),
        y: thumb.top + thumb.height / 2 - (box.top + box.height / 2),
        scale: thumb.width / box.width,
      };
    };

    const open = async (index, button) => {
      opener = button;
      openedAt = index;
      if (!calm.matches) gsap.set(big, { opacity: 0 });
      dialog.showModal();
      lenis.stop();
      await show(index);
      if (calm.matches || !dialog.open) return; // it can close while a slow image decodes
      gsap.fromTo(dialog, { '--veil': 0 }, { '--veil': VEIL, duration: 0.4 });
      gsap.fromTo(big, { ...overThumbnail(), opacity: 1 }, { x: 0, y: 0, scale: 1, duration: 0.55, ease: EASE });
    };

    const step = async (direction, animate) => {
      await show(current + direction);
      if (animate && !calm.matches && dialog.open) {
        // y and scale reset too: this can interrupt the opening flight
        gsap.fromTo(big, { x: direction * 32, y: 0, scale: 1, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: EASE, overwrite: true });
      }
    };

    const shut = () => {
      if (calm.matches) {
        dialog.close();
        return;
      }
      gsap.to(dialog, { '--veil': 0, duration: 0.3 });
      // The thumbnail may be off screen once the visitor has stepped away from it, so only its own image flies back
      gsap.to(big, {
        ...(current === openedAt ? overThumbnail() : { opacity: 0 }),
        duration: 0.3,
        ease: 'power2.inOut',
        overwrite: true,
        onComplete: () => dialog.close(),
      });
    };

    images.forEach((img, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Enlarge image: ${img.alt}`);
      img.parentElement.replaceChild(button, img);
      button.append(img);
      button.addEventListener('click', () => open(index, button));
    });

    $('.lightbox-close').addEventListener('click', shut);
    $('.lightbox-prev').addEventListener('click', () => step(-1, true));
    $('.lightbox-next').addEventListener('click', () => step(1, true));
    dialog.addEventListener('click', ({ target }) => {
      if (!target.closest('button, img')) shut();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      shut();
    });
    dialog.addEventListener('keydown', ({ key }) => { // instant: keyboard steps shouldn't wait on an animation
      if (key === 'ArrowLeft') step(-1, false);
      if (key === 'ArrowRight') step(1, false);
    });
    big.addEventListener('pointerdown', ({ clientX }) => { swipeStart = clientX; });
    big.addEventListener('pointerup', ({ clientX }) => {
      const distance = clientX - swipeStart;
      if (Math.abs(distance) > SWIPE_DISTANCE) step(distance < 0 ? 1 : -1, true);
    });
    dialog.addEventListener('close', () => {
      gsap.killTweensOf([big, dialog]);
      gsap.set(big, { clearProps: 'all' });
      lenis.start();
    });
  }

  function siteNav() {
    const nav = $('.top nav');
    const links = $$('.top nav a');
    const linkFor = new Map(links.map((link) => [$(link.getAttribute('href')), link]));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        const link = linkFor.get(target);
        if (isIntersecting) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-50% 0px' }); // whichever section crosses the middle of the screen
    linkFor.forEach((_, section) => observer.observe(section));
    links.forEach((link) => link.addEventListener('click', () => nav.hidePopover?.()));
  }

  function copyEmail() {
    const LABEL_RESET_MS = 2500;
    const button = $('.copy');
    if (!navigator.clipboard) return; // the mailto link is still there
    const label = button.textContent;
    let reset;
    button.hidden = false;
    button.addEventListener('click', async () => {
      clearTimeout(reset);
      try {
        await navigator.clipboard.writeText($('.mail').textContent);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Couldn\'t copy. Select the address above.';
      }
      reset = setTimeout(() => { button.textContent = label; }, LABEL_RESET_MS);
    });
  }

  lightbox();
  siteNav();
  copyEmail();

  const media = gsap.matchMedia();
  let nameChars = [];

  // Apart from the block below, so crossing a breakpoint doesn't replay the curtain
  media.add('(prefers-reduced-motion: no-preference)', () => {
    nameChars = intro();
  });

  // No motion path: without this condition nothing above runs, and the page is simply laid out
  media.add({
    motion: '(prefers-reduced-motion: no-preference)',
    wide: '(min-width: 761px)',
    fine: '(hover: hover) and (pointer: fine)',
  }, ({ conditions: { motion, wide, fine } }) => {
    if (!motion) return undefined;
    // Order matters: ScrollTrigger measures in creation order, so anything below a pin must be created after it
    chrome();
    heroScroll();
    parks(wide);
    equipment();
    const undoRooms = rooms(wide);
    textReveals(); // spans the whole page, so it waits for both pins
    otherWork();
    contact();
    const undoPointer = fine ? [nameFollowsPointer(nameChars), magneticMail()] : [];
    return () => [undoRooms, ...undoPointer].forEach((undo) => undo && undo());
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
