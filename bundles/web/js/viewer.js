jQuery(function ($) {
  // ヘッダー高さ取得関数
  function getHeaderHeight() {
    return $('.viewer-header').outerHeight();
  }

  // 薄冊標題+簿冊の下端位置（gap含む）を取得
  function getSubjectBottomPosition() {
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    
    if (isSp) {
      // SP版: 薄冊標題+簿冊の下（gap含む）
      var $titleLink = $('.viewer-header__title-link');
      if ($titleLink.length) {
        return $titleLink.offset().top;
      }
    }
    
    // PC版: ヘッダー全体の下
    return getHeaderHeight();
  }

  // モバイル版サイドバーの高さを取得
  function getMobileSidebarHeight() {
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    if (isSp) {
      var $sidebar = $('.p-viewer-select');
      return $sidebar.length ? $sidebar.outerHeight() : 56;
    }
    return 0;
  }

  function adjustViewerLayout() {
    window.requestAnimationFrame(function() {
      var isTablet = window.matchMedia('(max-width: 1080px) and (min-width: 741px)').matches;
      var isSp = window.matchMedia('(max-width: 740px)').matches;
      var isFullscreenMode = isFullscreen();
      var headerHeight = isFullscreenMode ? 0 : getHeaderHeight();
      
      // サイドバー高さ調整
      if (isSp) {
        // スマホ時のサイドバー（下部に配置）
        $('.p-viewer-select').css({
          top: 'auto',
          height: '4rem' // torem(56) = 56/14 = 4rem
        });
      } else if (isTablet) {
        // タブレット時のサイドバー（左側に配置）
        $('.p-viewer-select').css({
          top: headerHeight + 'px',
          height: 'calc(100vh - ' + headerHeight + 'px)'
        });
      } else {
        // PC時のサイドバー
        $('.p-viewer-select').css({
          top: headerHeight + 'px',
          height: 'calc(100vh - ' + headerHeight + 'px)'
        });
      }

      // メインコンテンツの位置調整
      if (isSp) {
        // 画面高を安全に取得し、ページ本体の縦スクロール発生を防ぐ
        var sidebarHeight = getMobileSidebarHeight(); // 通常 56px
        var contentHeight;
        if (spPseudoFullscreenActive) {
          contentHeight = '100svh'; // 全高
        } else {
          contentHeight = 'calc(100svh - ' + headerHeight + 'px - ' + sidebarHeight + 'px)';
        }

        $('.page-viewer-content').css({
          'top': spPseudoFullscreenActive ? '0' : headerHeight + 'px',
          'left': '0',
          'height': contentHeight,
          'bottom': 'auto' // bottom を明示的に解除
        });
      } else {
        $('.page-viewer-content').css({
          'top': headerHeight + 'px',
          'left': '70px',
          'bottom': '0',
          'height': '' // SP 用 height を解除
        });
      }
      
      // サムネイル一覧など各パネルの上端位置を算出
      //  スマホ:
      //    - 擬似フルスクリーン時      → 0
      //    - それ以外                 → 薄冊標題+簿冊の下端位置
      //  PC/タブレット               → ヘッダー高（全画面時は0）
      var subjectBottomPosition;
      if (isSp) {
        subjectBottomPosition = spPseudoFullscreenActive ? 0 : getSubjectBottomPosition();
      } else {
        subjectBottomPosition = headerHeight;
      }
      var sidebarHeight = getMobileSidebarHeight();
      var thumbnailHeight = isSp ? 
        'calc(100svh - ' + subjectBottomPosition + 'px - ' + sidebarHeight + 'px)' : 
        'calc(100vh - ' + subjectBottomPosition + 'px)';
      
      // CSS変数を設定（サムネイルなどのCSS fallback用）
      document.documentElement.style.setProperty('--viewer-content-top', subjectBottomPosition + 'px');
      
      $('.p-viewer-thumbnail').css({
        top: subjectBottomPosition + 'px',
        height: thumbnailHeight
      });
      
      // 資料情報パネルの位置調整
      var detailHeight = isSp ? 
        'calc(100svh - ' + subjectBottomPosition + 'px - ' + sidebarHeight + 'px)' : 
        'calc(100vh - ' + subjectBottomPosition + 'px)';
      $('.p-viewer-detail').css({
        top: subjectBottomPosition + 'px',
        height: detailHeight
      });
      
      // 翻刻表示パネルの位置調整
      if (isSp) {
        // パネル高さをpx固定ではなく rem で指定（200px ≒ 14.3rem）
        var translateHeightRem = 200 / 14; // 14.2857...
        var translateHeight = translateHeightRem.toFixed(2) + 'rem';
        var translateTop = 'calc(100svh - ' + sidebarHeight + 'px - ' + translateHeight + ')';
        $('.p-viewer-translate').css({
          top: translateTop,
          height: translateHeight
        });
      } else {
        // PC版は従来通り
        var translateHeight = 'calc(100vh - ' + subjectBottomPosition + 'px)';
        $('.p-viewer-translate').css({
          top: subjectBottomPosition + 'px',
          height: translateHeight
        });
      }
      
      // ダウンロードパネルの位置調整
      var downloadHeight = isSp ? 
        'calc(100svh - ' + subjectBottomPosition + 'px - ' + sidebarHeight + 'px)' : 
        'calc(100vh - ' + subjectBottomPosition + 'px)';
      $('.p-viewer-download').css({
        top: subjectBottomPosition + 'px',
        height: downloadHeight
      });
      
      // ダウンロード2パネルの位置調整（ダウンロードパネルと同様）
      $('.p-viewer-download2').css({
        top: subjectBottomPosition + 'px',
        height: downloadHeight
      });
      
      // ツリー表示パネルの位置調整（ダウンロードパネルと同様）
      $('.p-viewer-tree').css({
        top: subjectBottomPosition + 'px',
        height: downloadHeight
      });
      
      // 画面操作パネルの位置調整
      if (!isSp) {
        $('.p-viewer-controls').css('top', (subjectBottomPosition + 20) + 'px');
      } else {
        // SP版ではtopをリセット（CSSのbottomで制御）
        $('.p-viewer-controls').css('top', '');
      }
    });
  }
  
  // 初期化
  adjustViewerLayout();
  
  // リサイズ時の調整
  var resizeTimeout;
  $(window).on('resize', function() {
    var isSpResize = window.matchMedia('(max-width: 740px)').matches;
    if (spPseudoFullscreenActive) {
      // 擬似フルスクリーンは SP 専用、画面幅が変われば終了
      exitPseudoFullscreen();
    } else if (isSpResize && isFullscreen()) {
      // ネイティブフルスクリーン解除は SP 幅のみ（PC は維持）
      exitFullscreen();
    }

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(adjustViewerLayout, 50);
  });

  // サムネイル一覧を閉じる共通関数
  function closeThumbnailPanel() {
    $('.p-viewer-thumbnail').removeClass('is-active');
    $('.p-viewer-select__item[data-target="thumbnail"]').removeClass('is-current');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    $('.page-viewer-content').css('left', isSp ? '0' : '70px');
  }

  // 資料情報パネルを閉じる共通関数
  function closeDetailPanel() {
    $('.p-viewer-detail').removeClass('is-active');
    $('.p-viewer-select__item[data-target="details"]').removeClass('is-current');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    $('.page-viewer-content').css('left', isSp ? '0' : '70px');
  }

  // 翻刻表示パネルを閉じる共通関数
  function closeTranslatePanel() {
    $('.p-viewer-translate').removeClass('is-active');
    $('.p-viewer-select__item[data-target="translate"]').removeClass('is-current');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    $('.page-viewer-content').css('left', isSp ? '0' : '70px');
  }

  // ダウンロードパネルを閉じる共通関数
  function closeDownloadPanel() {
    $('.p-viewer-download').removeClass('is-active');
    $('.p-viewer-select__item[data-target="printdl"]').removeClass('is-current');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    $('.page-viewer-content').css('left', isSp ? '0' : '70px');
  }

  // ダウンロードパネル2を閉じる共通関数
  function closeDownload2Panel() {
    $('.p-viewer-download2').removeClass('is-active');
    $('.p-viewer-select__item[data-target="download"]').removeClass('is-current');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    $('.page-viewer-content').css('left', isSp ? '0' : '70px');
  }

  // 画面操作パネルを閉じる共通関数
  function closeControlsPanel() {
    $('.p-viewer-controls').removeClass('is-active');
    $('.p-viewer-select__item[data-target="img_control"]').removeClass('is-current');
  }

  // 概観図パネルを閉じる共通関数（使用禁止：独立システムのため）
  function closeOverviewPanel() {
    // $('.p-viewer-overview').removeClass('is-active');
    // $('.p-viewer-select__item[data-target="about"]').removeClass('is-current');
  }

  // サイドバーボタンの切り替え機能（概観図・全画面以外）
  function toggleSidebarItem(clickedButton) {
    // 概観図の現在の状態をログ出力
    var $overviewBtn = $('.p-viewer-select__item[data-target="about"]');
    
    // 全画面表示中の場合、全画面ボタンのis-currentは維持
    var $fullscreenBtn = $('.p-viewer-select__item[data-target="fullscreen"]');
    var isFullscreenActive = isFullscreen() && $fullscreenBtn.hasClass('is-current');
    
    // 現在のcurrentクラスを削除（概観図・全画面以外は独立管理）
    // 概観図と全画面以外のボタンのみを対象とする
    $('.p-viewer-select__item[data-target="thumbnail"].is-current').removeClass('is-current');
    $('.p-viewer-select__item[data-target="details"].is-current').removeClass('is-current');
    $('.p-viewer-select__item[data-target="translate"].is-current').removeClass('is-current');
    $('.p-viewer-select__item[data-target="printdl"].is-current').removeClass('is-current');
    $('.p-viewer-select__item[data-target="download"].is-current').removeClass('is-current');
    $('.p-viewer-select__item[data-target="img_control"].is-current').removeClass('is-current');
    $('.p-viewer-select__item[data-target="tree"].is-current').removeClass('is-current');
    
    // 全画面表示中の場合は全画面ボタンのis-currentを復元
    if (isFullscreenActive) {
      $fullscreenBtn.addClass('is-current');
    }
    
    // クリックされたボタンにcurrentクラスを追加
    $(clickedButton).addClass('is-current');
  }

  // サムネイルボタンクリック時の処理
  $('.p-viewer-select__item[data-target="thumbnail"]').on('click', function() {
    var $this = $(this);
    var $thumbnailPanel = $('.p-viewer-thumbnail');
    
    // 既にアクティブな場合は閉じる
    if ($this.hasClass('is-current')) {
      closeThumbnailPanel();
      return;
    }
    
    // 他のパネルを閉じる（概観図は独立なので除外）
    closeDetailPanel();
    closeTranslatePanel();
    closeDownloadPanel();
    closeDownload2Panel();
    closeControlsPanel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // サムネイル一覧の表示
    $thumbnailPanel.addClass('is-active');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    if (!isSp) {
      $('.page-viewer-content').css('left', '325px');
    }
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // 資料情報ボタンクリック時の処理
  $('.p-viewer-select__item[data-target="details"]').on('click', function() {
    var $this = $(this);
    var $detailPanel = $('.p-viewer-detail');
    
    // 既にアクティブな場合は閉じる
    if ($this.hasClass('is-current')) {
      closeDetailPanel();
      return;
    }
    
    // 他のパネルを閉じる
    closeThumbnailPanel();
    closeTranslatePanel();
    closeDownloadPanel();
    closeDownload2Panel();
    closeControlsPanel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // 資料情報パネルの表示
    $detailPanel.addClass('is-active');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    if (!isSp) {
      $('.page-viewer-content').css('left', '230px');
    }
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // 翻刻表示ボタンクリック時の処理
  $('.p-viewer-select__item[data-target="translate"]').on('click', function() {
    var $this = $(this);
    var $translatePanel = $('.p-viewer-translate');
    
    // 既にアクティブな場合は閉じる
    if ($this.hasClass('is-current')) {
      closeTranslatePanel();
      return;
    }
    
    // 他のパネルを閉じる
    closeThumbnailPanel();
    closeDetailPanel();
    closeDownloadPanel();
    closeDownload2Panel();
    closeControlsPanel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // 翻刻表示パネルの表示
    $translatePanel.addClass('is-active');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    if (!isSp) {
      $('.page-viewer-content').css('left', '230px');
    }
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // ダウンロードボタンクリック時の処理
  $('.p-viewer-select__item[data-target="printdl"]').on('click', function() {
    var $this = $(this);
    var $downloadPanel = $('.p-viewer-download');
    
    // 既にアクティブな場合は閉じる
    if ($this.hasClass('is-current')) {
      closeDownloadPanel();
      return;
    }
    
    // 他のパネルを閉じる
    closeThumbnailPanel();
    closeDetailPanel();
    closeTranslatePanel();
    closeDownload2Panel();
    closeControlsPanel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // ダウンロードパネルの表示
    $downloadPanel.addClass('is-active');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    if (!isSp) {
      $('.page-viewer-content').css('left', '325px');
    }
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // ダウンロード2ボタンクリック時の処理
  $('.p-viewer-select__item[data-target="download"]').on('click', function() {
    var $this = $(this);
    var $download2Panel = $('.p-viewer-download2');
    
    // 既にアクティブな場合は閉じる
    if ($this.hasClass('is-current')) {
      closeDownload2Panel();
      return;
    }
    
    // 他のパネルを閉じる
    closeThumbnailPanel();
    closeDetailPanel();
    closeTranslatePanel();
    closeDownloadPanel();
    closeControlsPanel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // ダウンロード2パネルの表示
    $download2Panel.addClass('is-active');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    if (!isSp) {
      $('.page-viewer-content').css('left', '325px');
    }
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // 画面操作ボタンクリック時の処理
  $('.p-viewer-select__item[data-target="img_control"]').on('click', function() {
    var $this = $(this);
    var $controlsPanel = $('.p-viewer-controls');
    
    // 既にアクティブな場合は閉じる
    if ($this.hasClass('is-current')) {
      closeControlsPanel();
      return;
    }
    
    // 他のパネルを閉じる
    closeThumbnailPanel();
    closeDetailPanel();
    closeTranslatePanel();
    closeDownloadPanel();
    closeDownload2Panel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // 画面操作パネルの表示
    $controlsPanel.addClass('is-active');
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // 全画面機能
  function enterFullscreen() {
    var element = document.documentElement; // 全画面にする要素
    
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(function(err) {
        console.error('全画面表示エラー:', err);
      });
    } else if (element.webkitRequestFullscreen) { // Safari
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen();
    } else {
      console.error('全画面API非対応ブラウザです');
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(function(err) {
        console.error('全画面終了エラー:', err);
      });
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else {
      console.error('全画面終了API非対応ブラウザです');
    }
  }

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || 
              document.mozFullScreenElement || document.msFullscreenElement);
  }

  // 全画面ボタンクリック時の処理
  $('.p-viewer-select__item[data-target="fullscreen"]').on('click', function() {
    var $this = $(this);
    
    var isSpSize = window.matchMedia('(max-width: 740px)').matches;
    if (isSpSize) {

      var $header = $('.viewer-header');
      var $sidebar = $('.p-viewer-select');
      var $fullscreenCloseBtn = $('.p-viewer-fullscreen-close');

      if (spPseudoFullscreenActive) {
        // --- 擬似フルスクリーン解除 ---
        $header.show();
        $sidebar.show();
        $this.removeClass('is-current');
        spPseudoFullscreenActive = false;
        $fullscreenCloseBtn.removeClass('is-visible');
        // フルスクリーンクラスを削除
        $('body').removeClass('is-fullscreen');
      } else {
        // --- 擬似フルスクリーン開始 ---
        // 他パネルは全て閉じる
        closeThumbnailPanel();
        closeDetailPanel();
        closeTranslatePanel();
        closeDownloadPanel();
        closeDownload2Panel();
        closeControlsPanel();

        $header.hide();
        $sidebar.hide();
        $this.addClass('is-current');
        spPseudoFullscreenActive = true;
        $fullscreenCloseBtn.addClass('is-visible');
        // bodyにフルスクリーンクラスを付与
        $('body').addClass('is-fullscreen');
      }

      // レイアウトを再計算
      adjustViewerLayout();

      // 概観図の状態を保護
      protectOverviewState();

      return; // PC向けロジックはスキップ
    }
    
    // 既に全画面表示中の場合は終了
    if (isFullscreen()) {
      exitFullscreen();
      return;
    }
    
    // 他のパネルを閉じる
    closeThumbnailPanel();
    closeDetailPanel();
    closeTranslatePanel();
    closeDownloadPanel();
    closeDownload2Panel();
    closeControlsPanel();
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // 全画面表示開始
    enterFullscreen();
    
    // 概観図の状態を保護
    protectOverviewState();
  });

  // 全画面状態変更イベント
  $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', function() {
    var $fullscreenBtn = $('.p-viewer-select__item[data-target="fullscreen"]');
    var $header = $('.viewer-header');
    var $fullscreenCloseBtn = $('.p-viewer-fullscreen-close');
    
    if (isFullscreen()) {
      // 全画面表示開始時
      
      // bodyにフルスクリーンクラスを付与
      $('body').addClass('is-fullscreen');
      // ヘッダーを非表示
      $header.hide();
      
      // フルスクリーン閉じるボタンを表示
      $fullscreenCloseBtn.addClass('is-visible');
      
      // レイアウトを再計算
      adjustViewerLayout();
    } else {
      // 全画面表示終了時
      
      // bodyからフルスクリーンクラスを除去
      $('body').removeClass('is-fullscreen');
      // ヘッダーを再表示
      $header.show();
      
      // フルスクリーン閉じるボタンを非表示
      $fullscreenCloseBtn.removeClass('is-visible');
      
      // ボタンの選択状態を解除
      $fullscreenBtn.removeClass('is-current');
      
      // レイアウトを再計算
      adjustViewerLayout();
    }
  });

  // フルスクリーン閉じるボタンクリック時の処理
  $('.p-viewer-fullscreen-close').on('click', function() {
    if (isFullscreen()) {
      exitFullscreen();
      return;
    }

    // スマホ擬似フルスクリーン解除
    if (spPseudoFullscreenActive) {
      var $header = $('.viewer-header');
      var $sidebar = $('.p-viewer-select');
      var $fullscreenBtn = $('.p-viewer-select__item[data-target="fullscreen"]');
      $(this).removeClass('is-visible');

      $header.show();
      $sidebar.show();
      $fullscreenBtn.removeClass('is-current');
      spPseudoFullscreenActive = false;
      // フルスクリーンクラスを削除
      $('body').removeClass('is-fullscreen');

      adjustViewerLayout();
      protectOverviewState();
    }
  });

  // 概観図の状態を記録する変数
  var overviewState = {
    isActive: false,
    lastToggleTime: 0
  };
  
  // スマホ用疑似フルスクリーン状態
  var spPseudoFullscreenActive = false;
  
  // 概観図専用toggle関数
  function toggleOverview() {
    var $overviewBtn = $('.p-viewer-select__item[data-target="about"]');
    var $overviewPanel = $('.p-viewer-overview');
    
    if ($overviewBtn.hasClass('is-current')) {
      // 概観図を閉じる
      $overviewBtn.removeClass('is-current');
      $overviewPanel.removeClass('is-active');
      overviewState.isActive = false;
      overviewState.lastToggleTime = Date.now();
    } else {
      // 概観図を開く
      $overviewBtn.addClass('is-current');
      $overviewPanel.addClass('is-active');
      overviewState.isActive = true;
      overviewState.lastToggleTime = Date.now();
    }
  }
  
  // 概観図の状態を監視して自動復元する関数
  function protectOverviewState() {
    var $overviewBtn = $('.p-viewer-select__item[data-target="about"]');
    var $overviewPanel = $('.p-viewer-overview');
    
    // 現在の状態と記録された状態が異なる場合は復元
    var currentBtnState = $overviewBtn.hasClass('is-current');
    var currentPanelState = $overviewPanel.hasClass('is-active');
    
    if (currentBtnState !== overviewState.isActive || currentPanelState !== overviewState.isActive) {
      // 記録された状態に復元
      if (overviewState.isActive) {
        $overviewBtn.addClass('is-current');
        $overviewPanel.addClass('is-active');
      } else {
        $overviewBtn.removeClass('is-current');
        $overviewPanel.removeClass('is-active');
      }
    }
  }

  // 概観図ボタンクリック時の処理（完全独立）
  // 既存のイベントリスナーをすべて削除
  $('.p-viewer-select__item[data-target="about"]').off('click');
  
  // 独立したイベントリスナーを設定
  $('.p-viewer-select__item[data-target="about"]').on('click', function(e) {
    e.stopPropagation(); // イベントの伝播を停止
    e.preventDefault(); // デフォルトの動作を防止
    
    toggleOverview();
    
    return false; // 追加の防止措置
  });

  // 他のサイドバーボタンクリック時の処理（一時的に無効化）
  /*
  $('.p-viewer-select__item').not('[data-target="thumbnail"]').not('[data-target="details"]').not('[data-target="translate"]').not('[data-target="printdl"]').not('[data-target="img_control"]').not('[data-target="fullscreen"]').not('[data-target="about"]').on('click', function() {
    var $this = $(this);
    
    // サムネイル一覧を閉じる
    closeThumbnailPanel();
    
    // 資料情報パネルを閉じる
    closeDetailPanel();
    
    // 翻刻表示パネルを閉じる
    closeTranslatePanel();
    
    // ダウンロードパネルを閉じる
    closeDownloadPanel();
    
    // 画面操作パネルを閉じる
    closeControlsPanel();
    
    // 概観図パネルは独立なので閉じない
    
    // ボタンの切り替え
    toggleSidebarItem($this);
    
    // 他のパネルの処理がある場合はここに追加
  });
  */

  // 概観図パネルの閉じるボタンクリック時の処理
  $('.p-viewer-overview__close').on('click', function() {
    // 概観図が開いている状態なら閉じる
    var $overviewBtn = $('.p-viewer-select__item[data-target="about"]');
    if ($overviewBtn.hasClass('is-current')) {
      toggleOverview();
    }
  });

  // 画面外クリック時の処理
  $(document).on('click', function(e) {
    var $target = $(e.target);
    var $thumbnailPanel = $('.p-viewer-thumbnail');
    var $detailPanel = $('.p-viewer-detail');
    var $translatePanel = $('.p-viewer-translate');
    var $downloadPanel = $('.p-viewer-download');
    var $download2Panel = $('.p-viewer-download2');
    var $controlsPanel = $('.p-viewer-controls');
    var $overviewPanel = $('.p-viewer-overview');
    var $treePanel = $('.p-viewer-tree');
    
    // サムネイル一覧が表示されている場合のみ処理
    if ($thumbnailPanel.hasClass('is-active')) {
      // サムネイル一覧パネル自体、またはサムネイルボタンをクリックした場合は何もしない
      if ($target.closest('.p-viewer-thumbnail').length === 0 && 
          $target.closest('.p-viewer-select__item[data-target="thumbnail"]').length === 0) {
        closeThumbnailPanel();
      }
    }
    
    // 資料情報パネルが表示されている場合のみ処理
    if ($detailPanel.hasClass('is-active')) {
      // 資料情報パネル自体、または資料情報ボタンをクリックした場合は何もしない
      if ($target.closest('.p-viewer-detail').length === 0 && 
          $target.closest('.p-viewer-select__item[data-target="details"]').length === 0) {
        closeDetailPanel();
      }
    }
    
    // 翻刻表示パネルが表示されている場合のみ処理
    if ($translatePanel.hasClass('is-active')) {
      // 翻刻表示パネル自体、または翻刻表示ボタンをクリックした場合は何もしない
      if ($target.closest('.p-viewer-translate').length === 0 && 
          $target.closest('.p-viewer-select__item[data-target="translate"]').length === 0) {
        closeTranslatePanel();
      }
    }
    
    // ダウンロードパネルが表示されている場合のみ処理
    if ($downloadPanel.hasClass('is-active')) {
      // ダウンロードパネル自体、またはダウンロードボタンをクリックした場合は何もしない
      if ($target.closest('.p-viewer-download').length === 0 && 
          $target.closest('.p-viewer-select__item[data-target="printdl"]').length === 0) {
        closeDownloadPanel();
      }
    }
    
    // ダウンロード2パネルが表示されている場合のみ処理
    if ($download2Panel.hasClass('is-active')) {
      // ダウンロード2パネル自体、またはダウンロード2ボタンをクリックした場合は何もしない
      if ($target.closest('.p-viewer-download2').length === 0 && 
          $target.closest('.p-viewer-select__item[data-target="download"]').length === 0) {
        closeDownload2Panel();
      }
    }
    
    // 画面操作パネルが表示されている場合のみ処理
    if ($controlsPanel.hasClass('is-active')) {
      // 画面操作パネル自体、または画面操作ボタンをクリックした場合は何もしない
      if ($target.closest('.p-viewer-controls').length === 0 && 
          $target.closest('.p-viewer-select__item[data-target="img_control"]').length === 0) {
        closeControlsPanel();
      }
    }
    
    // ツリー表示パネルが表示されている場合
    if ($treePanel.hasClass('is-active')) {
      if ($target.closest('.p-viewer-tree').length === 0 &&
          $target.closest('.p-viewer-select__item[data-target="tree"]').length === 0) {
        closeTreePanel();
      }
    }
    
    // 概観図パネルは独立システムのため画面外クリック処理なし
    // （概観図は手動でのみ開閉する）
  });

  // サムネイルアイテムクリック時の処理
  $('.p-viewer-thumbnail__item').on('click', function() {
    var $this = $(this);
    
    // 現在のcurrentクラスを削除
    $('.p-viewer-thumbnail__item.is-current').removeClass('is-current');
    
    // クリックされたアイテムにcurrentクラスを追加
    $this.addClass('is-current');
    
    // ページ番号を取得（必要に応じて他の処理を追加）
    var pageNumber = $this.data('page');
  });

  // 翻刻表示テキストボタンクリック時の処理
  $('.p-viewer-translate__text-btn').on('click', function() {
    var $this = $(this);
    
    // currentクラスの切り替え
    $this.toggleClass('is-current');
    
    // selectedクラスの切り替えも可能（青い枠線）
    // $this.toggleClass('is-selected');
  });

  // ツリー表示パネルを閉じる共通関数
  function closeTreePanel() {
    $('.p-viewer-tree').removeClass('is-active');
    $('.p-viewer-select__item[data-target="tree"]').removeClass('is-current');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    $('.page-viewer-content').css('left', isSp ? '0' : '70px');
  }

  // ツリー表示ボタンクリック時の処理
  $('.p-viewer-select__item[data-target="tree"]').on('click', function() {
    var $this = $(this);
    var $treePanel = $('.p-viewer-tree');

    // 既にアクティブなら閉じる
    if ($this.hasClass('is-current')) {
      closeTreePanel();
      return;
    }

    // 他パネルを閉じる
    closeThumbnailPanel();
    closeDetailPanel();
    closeTranslatePanel();
    closeDownloadPanel();
    closeDownload2Panel();
    closeControlsPanel();

    // ボタン切替
    toggleSidebarItem($this);

    // パネル表示
    $treePanel.addClass('is-active');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    var isTablet = window.matchMedia('(max-width: 1080px) and (min-width: 741px)').matches;
    
    if (!isSp) {
      // パネルの拡張状態を考慮してメインコンテンツの位置を調整
      var leftPosition;
      if ($treePanel.hasClass('is-expanded')) {
        leftPosition = isTablet ? '450px' : '500px';
      } else {
        leftPosition = isTablet ? '280px' : '325px';
      }
      $('.page-viewer-content').css('left', leftPosition);
    }

    protectOverviewState();
  });

  // ツリー表示パネルの内容は HTML 上で定義し、JS でのクローンは行わない

  // ツリー表示パネルのタイトルボタンクリック時の処理（幅を拡張/縮小）
  $(document).on('click', '.p-viewer-tree__title', function() {
    var $treePanel = $('.p-viewer-tree');
    var $mainContent = $('.page-viewer-content');
    var isSp = window.matchMedia('(max-width: 740px)').matches;
    var isTablet = window.matchMedia('(max-width: 1080px) and (min-width: 741px)').matches;
    
    // SPの場合は幅の変更なし
    if (isSp) {
      return;
    }
    
    // 拡張状態をtoggle
    $treePanel.toggleClass('is-expanded');
    
    // メインコンテンツの left を調整
    var leftPosition;
    if ($treePanel.hasClass('is-expanded')) {
      // 拡張時: タブレット450px、PC500px
      leftPosition = isTablet ? '450px' : '500px';
    } else {
      // 通常時: タブレット280px、PC325px
      leftPosition = isTablet ? '280px' : '325px';
    }
    $mainContent.css('left', leftPosition);
  });

  // ツリー表示パネルのクリアボタンクリック時の処理
  $(document).on('click', '.p-viewer-tree__btn--clear', function() {
    // ツリー内の全てのチェックボックスをクリア
    $('.sidebar-tree__check-input').prop('checked', false);
  });

  // ツリー表示パネルの上限件数
  var MAX_TREE_COUNT = 30;

  // ツリー表示パネルのチェックボックス変更時の処理
  $(document).on('change', '.sidebar-tree__check-input', function() {
    var $this = $(this);
    var checkedCount = $('.sidebar-tree__check-input:checked').length;
    
    // チェックされた場合の上限チェック
    if ($this.is(':checked')) {
      if (checkedCount > MAX_TREE_COUNT) {
        // 上限を超えた場合はチェックを外してアラート表示
        $this.prop('checked', false);
        alert('一度に選択できる上限は' + MAX_TREE_COUNT + '件です。');
        return;
      }
    }
  });

  // スマホ擬似フルスクリーン終了共通関数
  function exitPseudoFullscreen() {
    if (!spPseudoFullscreenActive) return;

    var $header = $('.viewer-header');
    var $sidebar = $('.p-viewer-select');
    var $fullscreenBtn = $('.p-viewer-select__item[data-target="fullscreen"]');
    var $fullscreenCloseBtn = $('.p-viewer-fullscreen-close');

    $header.show();
    $sidebar.show();
    $fullscreenBtn.removeClass('is-current');
    $fullscreenCloseBtn.removeClass('is-visible');

    $('body').removeClass('is-fullscreen');

    spPseudoFullscreenActive = false;

    // レイアウトを再計算
    adjustViewerLayout();
    protectOverviewState();
  }

  // URIコピー
  $(document).on('click', '.js-uri-copy-btn', function() {
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function() {
        alert('URIをコピーしました');
      }).catch(function() {
        fallbackCopyText(url);
      });
    } else {
      fallbackCopyText(url);
    }
  });

  function fallbackCopyText(text) {
    var $temp = $('<input>');
    $('body').append($temp);
    $temp.val(text).select();
    try {
      document.execCommand('copy');
      alert('URIをコピーしました');
    } catch (e) {
      alert('コピーに失敗しました');
    }
    $temp.remove();
  }

});