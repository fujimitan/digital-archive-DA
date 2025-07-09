jQuery(document).ready(function ($) {

  //情報表示切り替え
  $('.archive-detail-tabs__item').on('click', function () {
    const style = $(this).data('style');
    $('.archive-detail-tabs__item').removeClass('is-current');
    $(this).addClass('is-current');
    $('.archive-detail-section').each(function () {
      const $section = $(this);
      const classes = $section.attr('class').split(' ');
      const filtered = classes.filter(c => !/^is-/.test(c));
      $section.attr('class', filtered.join(' '));
      $section.addClass('is-' + style);
    });
  });

  //スライダー
  const swiper = new Swiper('.img-wrap-slider__main', {
    loop: true,
    navigation: {
      nextEl: '.img-wrap-slider__next',
      prevEl: '.img-wrap-slider__prev',
    },
  });

  //コピー
  $('.archive-detail-section__data-copy-btn').on('click', function () {
    const $input = $(this).siblings('.archive-detail-section__data-copy-input');
    $input.select();
    document.execCommand('copy');
    alert('コピーしました');
  });

  //検索を絞り込む
    $('#detail-sp-show-sidebar-btn').on('click', function () {
    $('.has-sidebar-layout__sidebar').toggleClass('sp-visible');
  });
});