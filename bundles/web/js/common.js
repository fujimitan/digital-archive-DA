
//=================
//functions
//=================

//チェックボックス(.cmn-check-item)class切り替え
window.updateCheckedState = function () {
  $('.cmn-check-item input[type="checkbox"]').each(function () {
    const $parent = $(this).closest('.cmn-check-item');
    $parent.toggleClass('is-checked', $(this).is(':checked'));
  });
}

//rem変換
window.getRemInPx = function () {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

jQuery(document).ready(function ($) {


  //=================
  //common
  //=================

  //ナビゲーション切り替え
  $(document).on('click', '#gNav-BT', function () {
    $(this).toggleClass('is-active');
    $('#gNav').toggleClass('is-active');
  });

  //ダークモード切り替え
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    $('html').attr('data-theme', savedTheme);
  }
  $(document).on('click', '#light-dark', function () {
    const $html = $('html');
    const current = $html.attr('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    $html.attr('data-theme', next);
    localStorage.setItem('theme', next);
  });

  //スムーススクロール
  $(document).on('click', 'a[href^="#"]', function (e) {
    const target = $(this).attr('href');

    e.preventDefault();

    if (target === '#') {
      $('html, body').animate({ scrollTop: 0 }, 600, 'swing');
    } else if ($(target).length) {
      $('html, body').animate({
        scrollTop: $(target).offset().top
      }, 500, 'swing');
    }
  });

  //フッター　トップに戻る
  function adjustToTopPosition() {
    const $toTop = $('.toTop');
    const $footer = $('#commonFooter');

    const footerTop = $footer.offset().top;
    const windowBottom = $(window).scrollTop() + $(window).height();
    const remPx = getRemInPx();
    const scrollTop = window.scrollY;

    $toTop.toggleClass('is-hide', scrollTop <= 20 * remPx);

    if (windowBottom > footerTop) {
      $toTop.removeClass('is-fixed').addClass('is-absolute');
    } else {
      $toTop.removeClass('is-absolute').addClass('is-fixed');
    }
  }

  if ($('.toTop').length) {
    $(window).on('scroll resize', adjustToTopPosition);
    $(window).on('load', adjustToTopPosition);
  }

  //=================
  //sidebar
  //=================

  //サイドバー　開閉
  $('.has-sidebar-layout__sidebar-toggle').on('click', function () {
    $(this).parent('.has-sidebar-layout__sidebar').toggleClass('is-open is-close');
  });
  function updateSidebarState() {
    const $sidebar = $('.has-sidebar-layout__sidebar');
    const winWidth = $(window).width();

    if (winWidth <= 920) {
      $sidebar.addClass('is-close').removeClass('is-open');
    } else {
      $sidebar.removeClass('is-close');
    }
  }

  $(window).on('load resize', updateSidebarState);

  function getVisibleFooterHeight() {
    const footer = document.getElementById('commonFooter');
    if (!footer) return 0;

    const rect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top >= windowHeight) return 0;
    return Math.min(rect.height, windowHeight - rect.top);
  }

  function adjustSidePosition() {
    const $sidebarContainer = $('.has-sidebar-layout__sidebar-container');
    const visibleFooterHeight = getVisibleFooterHeight();

    if (visibleFooterHeight > 0) {
      $sidebarContainer.css('padding-bottom', 15 + visibleFooterHeight);
    } else {
      $sidebarContainer.css('padding-bottom', '');
    }
  }

  $(window).on('scroll resize', adjustSidePosition);
  $(window).on('load', adjustSidePosition);

  //サイドバーsp　閉
  $('.has-sidebar-layout__sidebar-sp-close').on('click', function () {
    $('.has-sidebar-layout__sidebar').removeClass('sp-visible');
  });

  //サイドバー資料群階層　開閉
  $('.sidebar-tree__heading-opener').on('click', function () {
    $(this).closest('.sidebar-tree__heading').toggleClass('is-close');
  });
  $('.sidebar-tree__opener').on('click', function () {
    $(this).parent('.sidebar-tree__item-body').toggleClass('is-open is-close');
  });

  //サイドバー絞りこみ　バリデーション
  function getByteLength(str) {
    return new TextEncoder().encode(str).length;
  }

  $('.sidebar-filter__form').on('submit', function () {
    const keywordInput = $(this).find('.sidebar-filter__keyword input[type="text"].cmn-input');
    const val = keywordInput.val();

    if (getByteLength(val) > 256) {
      alert('256バイトを超えています');
      return false;
    }

  });

  //サイドバー目録種別　開閉
  $('.sidebar-filter__heading-opener').on('click', function () {
    $(this).closest('.sidebar-filter__heading').toggleClass('is-close');
  });
  $('.sidebar-filter__opener').on('click', function () {
    $(this).parent('.sidebar-filter__item-body').toggleClass('is-open is-close');
  });

  //サイドバー目録年代　開閉
  const SIDEBAR_ERA_SHOW_COUNT = 10;

  (function () {
    const $eraItems = $('.sidebar-filter__item--era');
    $eraItems.slice(0, SIDEBAR_ERA_SHOW_COUNT).removeClass('is-hidden').addClass('is-close');
    $eraItems.slice(SIDEBAR_ERA_SHOW_COUNT).addClass('is-hidden').removeClass('is-close');
  })();

  $('.sidebar-filter__era-btn').on('click', function () {
    const $btn = $(this);
    const $eraItems = $('.sidebar-filter__item--era');
    const $hiddenItems = $eraItems.filter('.is-hidden');
    const $opened = $btn.hasClass('is-opened');

    if (!$btn.hasClass('is-opened')) {
      // まだ全て表示していない場合、次のSHOW_COUNT個を表示
      const $toShow = $hiddenItems.slice(0, SIDEBAR_ERA_SHOW_COUNT);
      $toShow.removeClass('is-hidden').addClass('is-close');
      // 隠したままの要素の子孫チェックボックスをリセット
      $eraItems.filter('.is-hidden').each(function () {
        $(this)
          .find('input[type="checkbox"]')
          .prop('checked', false)
          .trigger('change');
        $(this)
          .find('.sidebar-filter__item-body')
          .addClass('is-close')
          .removeClass('is-open');
      });
      // 全て表示したらボタンにis-openedを追加
      if ($eraItems.filter('.is-hidden').length === 0) {
        $btn.addClass('is-opened');
      }
    } else {
      // 全て隠す（最初のSHOW_COUNT個以外is-hidden）
      $eraItems.removeClass('is-close is-hidden');
      $eraItems.slice(SIDEBAR_ERA_SHOW_COUNT).addClass('is-hidden').removeClass('is-close');
      // 隠した要素の子孫チェックボックスをリセット
      $eraItems.filter('.is-hidden').each(function () {
        $(this)
          .find('input[type="checkbox"]')
          .prop('checked', false)
          .trigger('change');
        $(this)
          .find('.sidebar-filter__item-body')
          .addClass('is-close')
          .removeClass('is-open');
      });
      $btn.removeClass('is-opened');
    }
  });

  //=================
  //external
  //=================

  //他機関　２カラムに分割
  const $items = $('.external-finder-institution__list > .external-finder-institution__list-item');
  const halfIndex = Math.ceil($items.length / 2);

  if (halfIndex > 0) {
    const $newList = $('<ul class="external-finder-institution__list"></ul>');

    $items.slice(halfIndex).appendTo($newList);

    $('.external-finder-institution__list').first().after($newList);
  }
  //他機関　開閉
  $('.external-finder-institution__opener').on('click', function () {
    $(this).closest('.external-finder-institution__list-item-body').toggleClass('is-close');
    $(this).closest('.external-finder-institution__list-item-body').next('.external-finder-institution__child-list').stop().slideToggle(300);
    updateExternalToggleButtonState();
  });

  // 全選択/全解除ボタン
  $('#external-checkAll').on('click', function () {
    const $container = $('.external-finder-institution__list-wrap');
    const $checkboxes = $container.find('.external-finder-institution__check-input');

    const isAllChecked = $checkboxes.length && $checkboxes.filter(':checked').length === $checkboxes.length;

    $checkboxes.prop('checked', !isAllChecked);

    // チェック状態見た目更新（別関数）
    updateCheckedState();
    updateExternalCheckAllState();
  });

  // 全選択ボタン状態を更新するだけの関数
  function updateExternalCheckAllState() {
    const $container = $('.external-finder-institution__list-wrap');
    const $checkboxes = $container.find('.external-finder-institution__check-input');
    const $btn = $('#external-checkAll');

    const isAllChecked = $checkboxes.length && $checkboxes.filter(':checked').length === $checkboxes.length;

    $btn.prop('checked', isAllChecked);
  }

  // 親 → 子
  function syncChildFromParent($parentCheckbox) {
    const isChecked = $parentCheckbox.is(':checked');
    const $childList = $parentCheckbox
      .closest('.external-finder-institution__list-item')
      .find('.external-finder-institution__child-list');

    $childList.find('.external-finder-institution__check-input')
      .prop('checked', isChecked);
  }

  // 子 → 親
  $(document).on('change', '.external-finder-institution__child-list-item .external-finder-institution__check-input', function () {
    const $childList = $(this).closest('.external-finder-institution__child-list');
    const $parentInput = $childList
      .closest('.external-finder-institution__list-item')
      .find('> .external-finder-institution__list-item-body .external-finder-institution__check-input');

    const $allChildren = $childList.find('.external-finder-institution__check-input');
    const $checkedChildren = $allChildren.filter(':checked');

    const allChecked = $allChildren.length === $checkedChildren.length;
    $parentInput.prop('checked', allChecked);

    updateCheckedState();
    updateExternalCheckAllState();
  });

  // 親 → 子 ハンドラ
  $(document).on('change', '.external-finder-institution__list-item > .external-finder-institution__list-item-body .external-finder-institution__check-input', function () {
    syncChildFromParent($(this));

    updateCheckedState();
    updateExternalCheckAllState();
  });

  //全て開く/閉じる
  function updateExternalToggleButtonState() {
    const $items = $('.external-finder-institution__list-item-body');
    const $btn = $('#external-toggleAll');
    const allClosed = $items.length && $items.filter('.is-close').length === $items.length;
    if (allClosed) {
      $btn.addClass('is-close');
    } else {
      $btn.removeClass('is-close');
    }
  }

  // クリック時の処理
  $('#external-toggleAll').on('click', function () {
    const $items = $('.external-finder-institution__list-item-body');
    const $btn = $(this);
    const allClosed = $items.length && $items.filter('.is-close').length === $items.length;

    if (allClosed) {
      $items.removeClass('is-close');
      $items.next('.external-finder-institution__child-list').stop().slideDown(300);
    } else {
      $items.addClass('is-close');
      $items.next('.external-finder-institution__child-list').stop().slideUp(300);
    }

    // 状態を再同期
    updateExternalToggleButtonState();
  });
  $('.external-finder-institution__list-item-body').addClass('is-close');
  updateExternalToggleButtonState();
  //=================
  //result
  //=================

  // 表示スタイル切り替え
  $('#result-display-style').on('change', function () {
    const style = $(this).find('option:selected').data('style');
    $('.archive-result-table').removeClass('is-simple is-detail is-thumbnail');
    $('.archive-result-table').addClass(`is-${style}`);
  });

  // 本文表示切り替え
  $('.result-excerpt-opener').on('click', function () {
    $(this).toggleClass('is-close');
  });

  //全選択/全解除
  $('#select-all-page').on('change', function () {
    const $checkboxes = $('.archive-result-table__body-item-cell.cell-request input[type="checkbox"]');
    const isChecked = $(this).is(':checked');
    $checkboxes.prop('checked', isChecked);
    updateCheckedState();
  });

  // Shift+クリックによる範囲選択機能
  let lastClickedCheckboxIndex = -1;

  $(document).on('click', '.archive-result-table__body-item-cell.cell-request input[type="checkbox"]', function (e) {
    const $checkboxes = $('.archive-result-table__body-item-cell.cell-request input[type="checkbox"]');
    const currentIndex = $checkboxes.index(this);

    if (e.shiftKey && lastClickedCheckboxIndex !== -1) {
      // 範囲選択を実行
      const startIndex = Math.min(lastClickedCheckboxIndex, currentIndex);
      const endIndex = Math.max(lastClickedCheckboxIndex, currentIndex);

      // 現在クリックされたチェックボックスの状態を基準にする
      const targetState = $(this).is(':checked');

      // 範囲内のすべてのチェックボックスを同じ状態にする
      for (let i = startIndex; i <= endIndex; i++) {
        $checkboxes.eq(i).prop('checked', targetState);
      }

      // 見た目を更新
      updateCheckedState();

      // 全選択ボタンの状態を更新
      const $selectAll = $('#select-all-page');
      if ($checkboxes.length && $checkboxes.filter(':checked').length === $checkboxes.length) {
        $selectAll.prop('checked', true);
      } else {
        $selectAll.prop('checked', false);
      }
    }

    // 最後にクリックされたチェックボックスのインデックスを更新
    lastClickedCheckboxIndex = currentIndex;
  });

  // 範囲選択時の文字列選択を防ぐ
  $(document).on('selectstart', '.archive-result-table', function (e) {
    if (e.shiftKey) {
      e.preventDefault();
      return false;
    }
  });

  // より具体的な要素での文字列選択防止
  $(document).on('selectstart', '.archive-result-table__body-item', function (e) {
    if (e.shiftKey) {
      e.preventDefault();
      return false;
    }
  });

  // mousedownでも文字列選択を防ぐ
  $(document).on('mousedown', '.archive-result-table__body-item', function (e) {
    if (e.shiftKey) {
      e.preventDefault();
      // CSSで一時的に文字列選択を無効化
      $(this).css('user-select', 'none');

      // 少し遅れて元に戻す
      setTimeout(() => {
        $(this).css('user-select', '');
      }, 100);
    }
  });

  // ドラッグ開始も防ぐ
  $(document).on('dragstart', '.archive-result-table__body-item', function (e) {
    if (e.shiftKey) {
      e.preventDefault();
      return false;
    }
  });

  $(document).on('change', '.archive-result-table__body-item-cell.cell-request input[type="checkbox"]', function () {
    const $checkboxes = $('.archive-result-table__body-item-cell.cell-request input[type="checkbox"]');
    const $selectAll = $('#select-all-page');
    // すべてチェックされていればselect-all-pageもON、1つでも外れていればOFF
    if ($checkboxes.length && $checkboxes.filter(':checked').length === $checkboxes.length) {
      $selectAll.prop('checked', true);
    } else {
      $selectAll.prop('checked', false);
    }
    updateCheckedState();
  });

  //利用請求制限
  $('.archive-result-form').on('submit', function () {
    const $checkboxes = $('.archive-result-table__body-item-cell.cell-request input[type="checkbox"]:checked');
    if ($checkboxes.length > 2) {
      if (!window.confirm('一度に21件以上の利用請求書の出力を行うことはできません。20件のみ利用請求書に設定します。')) {
        return false;
      }
      // 21件以上選択されている場合、最初の20件だけをcheckedにし、それ以外は外す
      $checkboxes.each(function (index) {
        if (index >= 20) {
          $(this).prop('checked', false);
        }
      });
      updateCheckedState();
      return true; // フォームを送信
    }
  });

  //=================
  //form
  //=================

  //チェックボックス(.cmn-check-item)class切り替え
  updateCheckedState();
  $('.cmn-check-item input[type="checkbox"]').on('change', updateCheckedState);


  //キーワード　サジェスト　※表示イベント設定なし
  $(document).on('click', '.suggest-list__bt', function () {
    const suggest_val = $(this).data('suggest-value');
    $(this).closest('.suggest-list')
      .prev('input.cmn-input')
      .val(suggest_val)
      .trigger('input');
    $(this).closest('.suggest-list').prev('input.cmn-input').removeClass('is-suggest');
  });
});