jQuery(document).ready(function ($) {

  //fv-load
  setTimeout(() => {
    $('.top-fv').addClass('loaded');
  }, 100);

  //fv-slide
  let sliderInstances = [];

  //fv-scroll
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 100) {
      $('.top-fv__scroll').addClass('is-hidden');
    } else {
      $('.top-fv__scroll').removeClass('is-hidden');
    }
  });

  // 無限スライダーの初期化
  function initTopFvSliders() {
    const slideWrap = document.querySelector('.top-fv__slideWrap');
    if (!slideWrap) return;

    // 1. cloneアイテムを削除
    const cloneItems = slideWrap.querySelectorAll('.top-fv__slide-item--clone');
    cloneItems.forEach(item => item.remove());
    console.log(`Removed ${cloneItems.length} clone items`);

    // 2. 元のアイテムを取得（cloneが消えた後）
    const originalItems = Array.from(slideWrap.querySelectorAll('.top-fv__slide-item'));
    if (originalItems.length === 0) return;
    console.log(`Original items count: ${originalItems.length}`);

    // 3. 既存のスライダー構造を削除
    slideWrap.innerHTML = '';

    // 4. 画面サイズに応じて分割数を決定
    const isMobile = window.innerWidth <= 768; // SP判定
    const splitCount = isMobile ? 3 : 2; // SP: 3分割, PC: 2分割
    
    console.log(`Screen size: ${window.innerWidth}px, Split count: ${splitCount}`);

    // 5. アイテムを分割してwrap作成
    const itemsPerSlide = Math.ceil(originalItems.length / splitCount);
    
    for (let i = 0; i < splitCount; i++) {
      const slideDiv = document.createElement('div');
      slideDiv.className = `top-fv__slide top-fv__slide--${i + 1}`;
      
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = 'top-fv__slide-wrapper';
      
      // 各スライダーにアイテムを配置
      const startIndex = i * itemsPerSlide;
      const endIndex = Math.min(startIndex + itemsPerSlide, originalItems.length);
      
      for (let j = startIndex; j < endIndex; j++) {
        wrapperDiv.appendChild(originalItems[j].cloneNode(true));
      }
      
      slideDiv.appendChild(wrapperDiv);
      slideWrap.appendChild(slideDiv);
    }

    // 6. 各スライダーを初期化
    const slides = document.querySelectorAll('.top-fv__slide');
    slides.forEach((slide, index) => {
      const wrapper = slide.querySelector('.top-fv__slide-wrapper');
      if (wrapper) {
        const sliderInstance = createInfiniteSlider(wrapper, index);
        if (sliderInstance) {
          sliderInstances[index] = sliderInstance;
        }
      }
    });
  }

  // 無限スライダーを作成する関数
  function createInfiniteSlider(wrapper, index) {
    // 元のアイテムを取得
    const originalItems = wrapper.querySelectorAll('.top-fv__slide-item');
    if (originalItems.length === 0) return null;

    const originalCount = originalItems.length;
    console.log(`Slider ${index}: Original items count: ${originalCount}`);

    // アイテムを複製して無限ループを作成（cloneにクラスを付ける）
    for (let i = 0; i < originalCount; i++) {
      const clonedItem = originalItems[i].cloneNode(true);
      clonedItem.classList.add('top-fv__slide-item--clone');
      wrapper.appendChild(clonedItem);
    }
    
    const finalItems = wrapper.querySelectorAll('.top-fv__slide-item');
    console.log(`Slider ${index}: Final items count: ${finalItems.length} (original: ${originalCount}, clones: ${finalItems.length - originalCount})`);

    // アニメーション設定
    const duration = 100000; // 100秒
    let totalWidth = 0;
    for (let i = 0; i < originalCount; i++) {
      totalWidth += originalItems[i].offsetWidth;
    }
    
    let animationId = null;
    let startTime = null;
    let pausedElapsed = 0;
    let isPaused = false;

    // 偶数個目のスライダー（index: 1, 3, 5...）は逆方向に移動
    const isReverse = index % 2 === 1;

    // 初期位置を設定（偶数個目は左端の外側から開始）
    if (isReverse) {
      wrapper.style.transform = `translateX(-${totalWidth}px)`;
    }

    // アニメーション関数
    function animate(currentTime) {
      if (!startTime) startTime = currentTime;
      
      if (isPaused) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      // 一時停止時間を考慮した経過時間の計算
      const elapsed = currentTime - startTime + pausedElapsed;
      const progress = (elapsed % duration) / duration;
      
      // 横方向に移動（偶数個目は逆方向）
      const translateX = isReverse ? -totalWidth + (progress * totalWidth) : -progress * totalWidth;
      wrapper.style.transform = `translateX(${translateX}px)`;

      animationId = requestAnimationFrame(animate);
    }

    // アニメーション開始
    function startAnimation() {
      if (!animationId) {
        animationId = requestAnimationFrame(animate);
      }
      // 再開時はstartTimeをリセット
      startTime = null;
      isPaused = false;
    }

    // アニメーション停止
    function stopAnimation() {
      if (!isPaused) {
        // 現在の経過時間を記録
        pausedElapsed = (performance.now() - startTime + pausedElapsed) % duration;
      }
      isPaused = true;
    }

    // アニメーション破棄
    function destroy() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    // アニメーション開始
    startAnimation();

    return {
      startAnimation,
      stopAnimation,
      destroy,
      get isRunning() { return !isPaused; }
    };
  }

  let prevInnerWidth = window.innerWidth;
  let isInitialized = false;
  
  function safeInit() {
    if (isInitialized) return;
    
    // 画像の読み込みを待たずに即座に初期化
    initTopFvSliders();
    
    // スライダーの初期化完了を待ってからボタンを初期化
    setTimeout(() => {
      console.log('Initializing autoplay control, sliderInstances:', sliderInstances);
      initAutoplayControl();
      isInitialized = true;
    }, 200);
  }

  if (document.readyState === 'complete') {
    safeInit();
  } else {
    window.addEventListener('load', safeInit);
  }

  // リサイズ処理を簡素化
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    
    resizeTimer = setTimeout(() => {
      const currentInnerWidth = window.innerWidth;
      if (currentInnerWidth !== prevInnerWidth) {
        prevInnerWidth = currentInnerWidth;
        console.log('Resize detected, reinitializing sliders');
        
        // 既存のスライダーインスタンスをクリア
        sliderInstances.forEach(slider => {
          if (slider && slider.destroy) {
            slider.destroy();
          }
        });
        sliderInstances = [];
        
        // スライダーを再初期化（分割数も再計算）
        isInitialized = false;
        initTopFvSliders();
        setTimeout(() => {
          initAutoplayControl();
          isInitialized = true;
        }, 100);
      }
    }, 300);
  });

  // 自動再生制御ボタンのイベント
  function initAutoplayControl() {
    const controlBtn = document.getElementById('autoplay-control');
    if (!controlBtn) return;

    // 既存のイベントリスナーを削除
    const oldControlBtn = controlBtn;
    const newControlBtn = controlBtn.cloneNode(true);
    controlBtn.parentNode.replaceChild(newControlBtn, controlBtn);

    // 初期状態を設定（再生中なのでpausedクラスは不要）
    newControlBtn.classList.remove('paused');
    newControlBtn.setAttribute('aria-label', '自動再生を一時停止');

    newControlBtn.addEventListener('click', () => {
      console.log('Control button clicked, sliderInstances:', sliderInstances);
      
      const hasRunningSliders = sliderInstances.some(slider => slider && slider.isRunning);
      console.log('Has running sliders:', hasRunningSliders);
      
      // スライダーの状態を切り替え
      sliderInstances.forEach((slider, index) => {
        if (slider) {
          if (hasRunningSliders) {
            console.log(`Stopping slider ${index}`);
            slider.stopAnimation();
          } else {
            console.log(`Starting slider ${index}`);
            slider.startAnimation();
          }
        }
      });

      // ボタンの状態を更新（クリック後の状態）
      const willBePaused = hasRunningSliders; // 現在再生中なら、クリック後は停止状態
      console.log('Will be paused after click:', willBePaused);
      
      if (willBePaused) {
        newControlBtn.classList.add('paused');
        newControlBtn.setAttribute('aria-label', '自動再生を再開');
        console.log('Button state: PAUSED (showing play icon)');
      } else {
        newControlBtn.classList.remove('paused');
        newControlBtn.setAttribute('aria-label', '自動再生を一時停止');
        console.log('Button state: PLAYING (showing pause icon)');
      }
    });

    // 初期状態をログ出力
    console.log('Autoplay control initialized, initial button state: PLAYING (showing pause icon)');
  }

  //fv-form
  function getByteLength(str) {
    return new TextEncoder().encode(str).length;
  }

  $('.top-fv__searchform').on('submit', function () {
    const val = $('.top-fv__search__input').val();
    if (getByteLength(val) > 256) {
      alert('256バイトを超えています');
      return false;
    } else {
      //送信処理
      //alert('success');
      return true;
    }
  });

  //pickup
  function torem(px) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return px * (16 / rootFontSize);
  }
  
  // pickupセクションのスライダー（既存のSwiper設定を維持）
  if (document.querySelector('.top-pickup__slide')) {
    new Swiper('.top-pickup__slide', {
      spaceBetween: torem(36),
      slidesPerView: 1,

      breakpoints: {
        741: {
          slidesPerView: 2
        },
        1025: {
          slidesPerView: 3
        }
      },

      navigation: {
        nextEl: '#pickup-next',
        prevEl: '#pickup-prev',
      },
    });
  }

});
