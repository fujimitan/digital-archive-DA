jQuery(document).ready(function ($) {

  //バリデーション
  $('.external-finder-form').on('submit', function () {
    const $inputs = $(this).find('.external-finder-container').find('input[type="text"].cmn-input');
    const hasValue = $inputs.toArray().some(input => $(input).val().trim() !== '');

    if (!hasValue) {
      alert('1つ以上キーワードを入力してください');
      return false;
    } else {
      //送信処理
      return true;
    }
  });

  //フォームリセット
  $('.form-reset').on('click', function () {
    $('.sidebar-tree__check-input').prop('checked', false).trigger('change');
    requestAnimationFrame(() => {
      updateCheckedState();
    });
  });
});