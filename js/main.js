/* globals WOW:false window document*/
(function ($) {
  'use strict';

  // jQuery for page scrolling feature - requires jQuery Easing plugin
  $('a.page-scroll').bind('click', function (event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top - 50)
    }, 1250, 'easeInOutExpo');
    event.preventDefault();
  });

  // Highlight the top nav as scrolling occurs
  $('body').scrollspy({
    target: '#mainNav',
    offset: 51
  });

  // Closes the Responsive Menu on Menu Item Click
  $('.navbar-collapse a.nav-link').click(function () {
    $('.navbar-toggle:visible').click();
  });

  var header = $('#mainNav');
  $(window).scroll(function () {
    var scroll = $(window).scrollTop();
    if (scroll >= 50) {
      header.addClass('navbar-shaded');
    } else {
      header.removeClass('navbar-shaded');
    }
  });

  $('.scrambledmail').each(function () {
    var my = $(this);
    var link = '<a href="mailto:';
    link += my.data('name') + '@' + my.data('domain') + '.' + my.data('ext');
    link += '">' + my.html() + '</a>';
    my.replaceWith(link);
  });

  $(function () {
    var contactform = document.getElementById('contactform');
    var emailAddress = 'gc.digitalfellows';
    emailAddress += '@';
    emailAddress += 'gmail';
    emailAddress += '.com';
    if (contactform) {
      contactform.setAttribute('action', '//formspree.io/' + emailAddress);
    }
  });

  // Initialize WOW.js Scrolling Animations

  new WOW().init();
})(jQuery);
