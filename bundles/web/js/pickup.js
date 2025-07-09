jQuery(document).ready(function ($) {

  // ピックアップページの初期化
  function initPickupPage() {
    initMainTabs();
    initCategoryHierarchy();
    handleInitialTabFromURL();
    initMobileDropdowns();
  }

  // スマートフォン判定
  function isMobile() {
    return window.innerWidth <= 768;
  }

  // 全てのドロップダウンを閉じる関数（グローバルスコープ）
  function closeAllDropdowns() {
    $('.pickup-tabs').removeClass('is-dropdown-open');
    $('.pickup-tabs__tab').removeClass('is-dropdown-open');
    $('.category-hierarchy__mid-list, .category-hierarchy__sub-list').removeClass('is-dropdown-open');
    $('.category-hierarchy__category-btn').removeClass('is-dropdown-open');
  }

  // モバイル向けドロップダウン機能の初期化
  function initMobileDropdowns() {
         // タブのドロップダウン処理は initMainTabs() で統合

                  // カテゴリボタンのドロップダウン処理は initCategoryHierarchy() で統合

         // 外部クリックでドロップダウンを閉じる
     $(document).on('click', function(e) {
       if (isMobile()) {
         const $target = $(e.target);
         
         // タブまたはカテゴリボタン以外をクリックした場合
         if (!$target.closest('.pickup-tabs__tab').length && 
             !$target.closest('.category-hierarchy__category-btn').length) {
           closeAllDropdowns();
         }
       }
     });

     // ウィンドウリサイズ時の対応
     $(window).on('resize', function() {
       if (!isMobile()) {
         // デスクトップに戻った場合はドロップダウンクラスを削除
         closeAllDropdowns();
       }
     });
  }

  // URLクエリパラメータから初期タブを設定
  function handleInitialTabFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && /^tab[1-6]$/.test(tabParam)) {
      const $targetTabButton = $('.pickup-tabs__tab[data-tab="' + tabParam + '"]');
      if ($targetTabButton.length > 0) {
        // 既存のタブをリセット
        $('.pickup-tabs__tab').removeClass('is-active');
        $('.category-hierarchy__content').removeClass('is-active').hide();
        
        // 指定されたタブを選択
        $targetTabButton.addClass('is-active');
        $('[data-content="' + tabParam + '"]').addClass('is-active').show();
        
        // カテゴリボタンを初期化
        initCategoryButtons(tabParam);
        

      }
    }
  }

  // メインタブ（大分類）の初期化
  function initMainTabs() {
    const $tabs = $('.pickup-tabs__tab');
    const $contents = $('.category-hierarchy__content');

    // 初期状態：最初のタブをアクティブに
    $tabs.first().addClass('is-active');
    $contents.first().addClass('is-active').show();

    // タブクリックイベント
    $tabs.on('click', function(e) {
      const $this = $(this);
      const targetTab = $this.data('tab');
      
      // スマートフォンでアクティブなタブをクリックした場合はドロップダウンを切り替え
      if (isMobile() && $this.hasClass('is-active')) {
        const $tabsContainer = $('.pickup-tabs');
        $tabsContainer.toggleClass('is-dropdown-open');
        $this.toggleClass('is-dropdown-open');

        return;
      }
      
      // 非アクティブなタブがクリックされた場合、またはデスクトップの場合はタブ切り替え
      
      // すべてのタブから active クラスを削除
      $tabs.removeClass('is-active');
      // クリックされたタブに active クラスを追加
      $this.addClass('is-active');
      
      // すべてのコンテンツを非表示にして active クラスを削除
      $contents.removeClass('is-active').hide();
      // 対応するコンテンツを表示して active クラスを追加
      $('[data-content="' + targetTab + '"]').addClass('is-active').show();
      
      // 新しいタブのカテゴリを初期化
      initCategoryButtons(targetTab);
      
      // スマートフォンでドロップダウンを閉じる
      if (isMobile()) {
        closeAllDropdowns();
      }
    });

    // 初期状態のカテゴリボタンを初期化
    initCategoryButtons($tabs.first().data('tab'));
  }

  // カテゴリ階層の初期化
  function initCategoryHierarchy() {
    // カテゴリボタンのクリックイベント
    $(document).on('click', '.category-hierarchy__category-btn', function(e) {
      const $this = $(this);
      const $currentContent = $this.closest('.category-hierarchy__content');
      const targetCategory = $this.data('mid-category');
      
      // スマートフォンでアクティブなボタンをクリックした場合はドロップダウンを切り替え
      if (isMobile() && $this.hasClass('is-active')) {
        const $list = $this.closest('.category-hierarchy__mid-list, .category-hierarchy__sub-list');
        $list.toggleClass('is-dropdown-open');
        $this.toggleClass('is-dropdown-open');

        return;
      }
      
      // 中カテゴリボタンの場合
      if (targetCategory) {
        // 同じコンテンツ内の中カテゴリボタンから active クラスを削除
        $currentContent.find('.category-hierarchy__mid-list .category-hierarchy__category-btn').removeClass('is-active');
        // クリックされたボタンに active クラスを追加
        $this.addClass('is-active');
        
        // 小カテゴリの表示切り替え
        switchSubCategories($currentContent, targetCategory);
        
        // 小カテゴリの最初を自動選択
        selectFirstSubCategory($currentContent, targetCategory);
        
        // 詳細表示を更新
        updateCategoryDetail($currentContent, targetCategory);
        
        // スマートフォンでドロップダウンを閉じる
        if (isMobile()) {
          closeAllDropdowns();
        }
      } else {
        // 小カテゴリボタンの場合
        const $currentSubList = $this.closest('.category-hierarchy__sub-list');
        
        // 同じ小カテゴリリスト内のボタンから active クラスを削除
        $currentSubList.find('.category-hierarchy__category-btn').removeClass('is-active');
        // クリックされたボタンに active クラスを追加
        $this.addClass('is-active');
        
        // 詳細表示を更新
        updateCategoryDetailFromButton($this);
        
        // スマートフォンでドロップダウンを閉じる
        if (isMobile()) {
          closeAllDropdowns();
        }
        
        // ここで選択された小カテゴリの処理を実行
        // 例：コンテンツの絞り込み、API呼び出しなど

      }
    });
  }

  // 特定タブのカテゴリボタンを初期化
  function initCategoryButtons(tabId) {
    const $content = $('[data-content="' + tabId + '"]');
    
    // 小カテゴリの初期状態を先にリセット
    $content.find('.category-hierarchy__sub-list .category-hierarchy__category-btn').removeClass('is-active');
    
    // 中カテゴリの初期状態設定
    const $midBtns = $content.find('.category-hierarchy__mid-list .category-hierarchy__category-btn');
    $midBtns.removeClass('is-active');
    
    if ($midBtns.length > 0) {
      // 最初の中カテゴリボタンをアクティブに
      const $firstMidBtn = $midBtns.first();
      $firstMidBtn.addClass('is-active');
      
      // 対応する小カテゴリを表示
      const firstCategory = $firstMidBtn.data('mid-category');
      if (firstCategory) {
        switchSubCategories($content, firstCategory);
        // 小カテゴリの最初を自動選択
        selectFirstSubCategory($content, firstCategory);
        // 詳細表示を更新
        updateCategoryDetail($content, firstCategory);
      }
    }
  }

  // 小カテゴリの表示切り替え
  function switchSubCategories($content, targetCategory) {
    const $subLists = $content.find('.category-hierarchy__sub-list');
    
    // すべての小カテゴリリストを非表示
    $subLists.hide();
    
    // 対象の小カテゴリリストを表示
    const $targetSubList = $content.find('[data-sub-content="' + targetCategory + '"]');
    if ($targetSubList.length > 0) {
      $targetSubList.show();
      
      // 小カテゴリボタンの active 状態をリセット
      $targetSubList.find('.category-hierarchy__category-btn').removeClass('is-active');
    }
  }

  // 小カテゴリの最初を自動選択
  function selectFirstSubCategory($content, targetCategory) {
    const $targetSubList = $content.find('[data-sub-content="' + targetCategory + '"]');
    if ($targetSubList.length > 0) {
      const $firstSubBtn = $targetSubList.find('.category-hierarchy__category-btn').first();
      if ($firstSubBtn.length > 0) {
        $firstSubBtn.addClass('is-active');

      }
    }
  }

  // カテゴリ詳細表示を更新
  function updateCategoryDetail($content, targetCategory) {
    const $targetSubList = $content.find('[data-sub-content="' + targetCategory + '"]');
    if ($targetSubList.length > 0) {
      const $activeSubBtn = $targetSubList.find('.category-hierarchy__category-btn.is-active').first();
      if ($activeSubBtn.length > 0) {
        updateCategoryDetailFromButton($activeSubBtn);
      }
    }
  }

  // ボタンから詳細表示を更新
  function updateCategoryDetailFromButton($button) {
    const title = $button.data('sub-title') || 'タイトルが設定されていません';
    const description = $button.data('sub-description') || '説明文が設定されていません。';
    
    $('#categoryDetailTitle').text(title);
    $('#categoryDetailDescription').text(description);
    
    // コンテンツリストを表示
    displayContentList($button);
  }

  // コンテンツリストを表示
  function displayContentList($button) {
    const categoryKey = $button.find('span').text();
    const $contentList = $('#categoryContentList');
    const $allLists = $contentList.find('.content-list');
    
    // すべてのリストを非表示
    $allLists.hide();
    
    // 対応するリストを表示
    const $targetList = $contentList.find('[data-content-list="' + categoryKey + '"]');
    if ($targetList.length > 0) {
      $targetList.show();
      $contentList.show();
    } else {
      // 該当するリストがない場合はデフォルトを表示
      const $defaultList = $contentList.find('[data-content-list="default"]');
      if ($defaultList.length > 0) {
        $defaultList.show();
        $contentList.show();
      } else {
        $contentList.hide();
      }
    }
  }





  // カテゴリ選択状態の取得
  function getCurrentSelection() {
    const activeTab = $('.pickup-tabs__tab.is-active').data('tab');
    const $activeContent = $('[data-content="' + activeTab + '"]');
    const activeMidCategory = $activeContent.find('.category-hierarchy__mid-list .category-hierarchy__category-btn.is-active').find('span').text();
    const activeSubCategory = $activeContent.find('.category-hierarchy__sub-list .category-hierarchy__category-btn.is-active').find('span').text();
    
    return {
      mainCategory: $('.pickup-tabs__tab.is-active').find('span').text(),
      midCategory: activeMidCategory || null,
      subCategory: activeSubCategory || null,
      tabId: activeTab
    };
  }

  // URLパラメータを更新
  function updateURLParameter(param, value) {
    const url = new URL(window.location);
    if (value) {
      url.searchParams.set(param, value);
    } else {
      url.searchParams.delete(param);
    }
    // ページをリロードせずにURLを更新
    window.history.replaceState({}, '', url);
  }

  // 外部から呼び出し可能な関数をグローバルに設定
  window.pickupUtils = {
    getCurrentSelection: getCurrentSelection,
    switchToTab: function(tabId) {
      $('.pickup-tabs__tab[data-tab="' + tabId + '"]').click();
    },
    updateURLParameter: updateURLParameter
  };

  // ページ初期化を実行
  initPickupPage();


});