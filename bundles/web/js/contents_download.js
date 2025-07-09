jQuery(document).ready(function ($) {
  // チェックボックスの上限件数（テスト用）
  var MAX_DOWNLOAD_COUNT = 3;

  // チェックボックス変更時の処理
  $(document).on('change', '.contents-download-tree__check input[type="checkbox"]', function() {
    var $this = $(this);
    var checkedCount = $('.contents-download-tree__check input[type="checkbox"]:checked').length;
    
    // チェックされた場合の上限チェック
    if ($this.is(':checked')) {
      if (checkedCount > MAX_DOWNLOAD_COUNT) {
        // 上限を超えた場合はチェックを外してアラート表示
        $this.prop('checked', false);
        alert('一度に選択できる上限は' + MAX_DOWNLOAD_COUNT + '件です。');
        return;
      }
    }
  });

  // クリアボタンでチェック解除
  $('.clear-btn').on('click', function() {
    // 全てのチェックボックスを解除
    $('.contents-download-tree__check input[type="checkbox"]').prop('checked', false);
  });
});