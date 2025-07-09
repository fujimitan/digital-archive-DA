jQuery(document).ready(function ($) {

  //検索を絞り込む
  $('#result-sp-show-sidebar-btn').on('click', function () {
    $('.has-sidebar-layout__sidebar').toggleClass('sp-visible');
  });
});