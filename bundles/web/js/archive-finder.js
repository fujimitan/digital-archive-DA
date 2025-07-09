jQuery(document).ready(function ($) {

  //バリデーション
  $('.archive-finder-form').on('submit', function () {
    const $inputs = $(this).find('.archive-finder-form-container__keyword-wrap').find('input[type="text"].cmn-input');
    const hasValue = $inputs.toArray().some(input => $(input).val().trim() !== '');

    if (!hasValue) {
      alert('1つ以上キーワードを入力してください');
      return false;
    } else {
      //送信処理
      return true;
    }
  });

  //検索エリア追加
  $('.archive-finder-form-container__keyword-bt').on('click', function () {
    const $wrap = $('.archive-finder-form-container__keyword-wrap');
    const count = $wrap.find('.archive-finder-form-container__keyword-item').length;

    if (count >= 6) return;

    const newIndex = count;

    const $clone = $wrap.find('.archive-finder-form-container__keyword-item').first().clone(false, false);

    // logic
    $clone.find('.archive-finder-form-container__keyword-logic select')
      .html(`
      <option value="AND">AND</option>
      <option value="OR">OR</option>
      <option value="NOT">NOT</option>
    `)
      .attr('name', `logic-${newIndex}`);

    // scope
    $clone.find('.archive-finder-form-container__keyword-scope select')
      .attr('name', `scope-${newIndex}`);

    // keyword input
    $clone.find('.archive-finder-form-container__keyword-word input[type="text"]').removeClass('is-suggest');
    $clone.find('.archive-finder-form-container__keyword-word input[type="text"]')
      .val('')
      .attr('name', `keyword-${newIndex}`);

    $wrap.append($clone);

    if (newIndex + 1 >= 6) {
      $('.archive-finder-form-container__keyword-bt').remove();
    }
  });

  //資料群階層選択
  if ($('.archive-finder-form-container__tree').length) {
    const $treeList = $('.archive-finder-form-container__tree-list');
    const $placeholder = $('.archive-finder-form-container__tree-placeholder');

    $('.sidebar-tree__check-input').on('change', function () {
      const $input = $(this);
      const $body = $input.closest('.sidebar-tree__item-body');
      const val = $body.data('tree-value');
      const idx = $('.sidebar-tree__check-input').index($input);
      const uniqueId = 'tree-val-' + idx;

      if ($input.is(':checked')) {
        if ($('#' + uniqueId).length === 0) {
          const $item = $('<li>', {
            id: uniqueId,
            class: 'archive-finder-form-container__tree-list-item'
          }).append(
            $('<input>', {
              type: 'hidden',
              value: val
            }),
            $('<span>').text(val)
          );
          $treeList.append($item);
        }
      } else {
        $('#' + uniqueId).remove();
      }

      const hasChecked = $('.sidebar-tree__check-input:checked').length > 0;

      if (hasChecked) {
        $placeholder.addClass('is-hidden');
        $treeList.removeClass('is-hidden');
      } else {
        $placeholder.removeClass('is-hidden');
        $treeList.addClass('is-hidden');
      }
    });
  }

  //sp 資料群階層選択表示
  $('.archive-finder-form-container__tree-sp-bt').on('click', function () {
    $('.has-sidebar-layout__sidebar').addClass('sp-visible');
  });

  //全選択/全解除
  $('.archive-finder-form-container__check-all').on('click', function () {
    const $btn = $(this);
    const $container = $btn.closest('.archive-finder-form-container__label-wrap').next('.archive-finder-form-container__content-wrap');
    const $checkboxes = $container.find('input[type="checkbox"]');

    const isAllChecked = $checkboxes.length && $checkboxes.filter(':checked').length === $checkboxes.length;

    $checkboxes.prop('checked', !isAllChecked);
    $btn.toggleClass('checked', !isAllChecked);
    updateCheckedState();
  });

  $('.archive-finder-form-container__check-list input[type="checkbox"]').on('change', function () {
    const $container = $(this).closest('.archive-finder-form-container__content-wrap');
    const $checkboxes = $container.find('input[type="checkbox"]');
    const $btn = $container.prev('.archive-finder-form-container__label-wrap').find('.archive-finder-form-container__check-all');

    const isAllChecked = $checkboxes.length && $checkboxes.filter(':checked').length === $checkboxes.length;

    $btn.toggleClass('checked', isAllChecked);
    updateCheckedState();
  });

  //検索条件トグル
  $('.archive-finder-search-filters-bt').on('click', function () {
    $(this).toggleClass('is-close');
  });

  //ツールチップ ヘルプ
  const tooltipSelector = '.archive-finder-form-container__tool-tip';

  $(document).on('click', function (e) {
    const $target = $(e.target);

    if (!$target.closest(tooltipSelector).length) {
      $(tooltipSelector).removeClass('is-active');
    }
  });

  $(tooltipSelector).on('click', function (e) {
    e.stopPropagation();
    const $this = $(this);
    const isActive = $this.hasClass('is-active');

    $(tooltipSelector).removeClass('is-active');
    if (!isActive) {
      $this.addClass('is-active');
    }
  });

  //元号モーダル
  function closeGengoModal() {
    const $modal = $('#gengo-modal');

    $modal.addClass('is-hiding');

    setTimeout(() => {
      $modal.removeClass('is-hiding').addClass('is-hidden');
    }, 300);
  }

  function openGengoModal() {
    const $modal = $('#gengo-modal');

    $modal.addClass('is-hiding');
    $modal.removeClass('is-hidden');
    setTimeout(() => {
      $modal.removeClass('is-hiding');
    }, 10);
  }

  let gengo_target = '';

  $('.archive-finder-form-container__date-gengo-bt').on('click', function () {
    gengo_target = $(this).parents('.archive-finder-form-container__date-gengo').data('gengo');
    openGengoModal();
  });

  $('#gengo-modal').on('click', function (e) {
    if ($(e.target).is('#gengo-modal')) {
      closeGengoModal();
    }
  });

  $('.gengo-modal__close-button').on('click', closeGengoModal);

  $('.gengo-modal__select-button').on('click', function () {
    const label = $(this).data('gengo-label');
    const $wrapper = $(`.archive-finder-form-container__date-gengo[data-gengo="${gengo_target}"]`);
    $wrapper.find('.archive-finder-form-container__date-gengo-bt__text').text(label);
    $wrapper.find('input[type="hidden"]').val(label);
    closeGengoModal();
  });

  $('.gengo-modal__tab').on('click', function () {
    const target = $(this).data('gengo-type-target');

    $('.gengo-modal__tab').removeClass('is-current');
    $(this).addClass('is-current');

    $('.gengo-modal__item').removeClass('is-current');
    $('.gengo-modal__item[data-gengo-type="' + target + '"]').addClass('is-current');
  });

  //フォームリセット
  $('.form-reset').on('click', function () {
    $('.sidebar-tree__check-input').prop('checked', false).trigger('change');
    requestAnimationFrame(() => {
      updateCheckedState();
    });
  });
});