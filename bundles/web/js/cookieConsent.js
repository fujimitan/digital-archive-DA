jQuery(document).ready(function ($) {
  
  // プレビュー用　トップ以外には表示しない
  if (window.location.pathname.split('/').pop() !== 'top.html') return;
  if ($('#cookie-consent').length) return;

  $('body').append(`
    <div id="cookie-consent" class="cookie-consent">
      <p class="cookie-consent__text">
        ご訪問いただきありがとうございます。<br class="br-sp">私たちがより良い情報を提供できるように、<a href="#">プライバシーポリシー</a>に基づいたクッキー（Cookie）の取得と利用に同意をお願いいたします。
      </p>
      <div class="cookie-consent__buttons">
        <button id="cookie-consent__button--minimum" class="cookie-consent__button cookie-consent__button--minimum">必要最小限</button>
        <button id="cookie-consent__button--all" class="cookie-consent__button cookie-consent__button--all">全て同意</button>
      </div>
    </div>
  `);

  $('#cookie-consent__button--minimum').on('click', function () {
    $('#cookie-consent').fadeOut(100);
    // 必要最小限ボタンの専用処理があればここに記述
  });

  $('#cookie-consent__button--all').on('click', function () {
    $('#cookie-consent').fadeOut(100);
    // すべて同意ボタンの専用処理があればここに記述
  });

});
