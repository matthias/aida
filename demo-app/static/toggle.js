jQuery(function ($) {
  $("a#toggle").toggle(
    function () {
      $("p#to-toggle").slideDown('normal');
      $("a#toggle").text('Alright, thanks.');
      return false;
    },
    function () {
      $("p#to-toggle").slideUp('normal');
      $("a#toggle").text('Show it again, please.');
      return false;
    }
  );
});
