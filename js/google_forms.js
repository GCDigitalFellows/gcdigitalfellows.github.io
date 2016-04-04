'use strict';

function postToGoogle() {
  var inputs = $('form#google-form').serializeJSON();
  var successPage = $('form#google-form').data('success');
  $.ajax({
    url: 'https://docs.google.com/forms/d/1R6WUAjYs4lxFsIiBncp9Fj_e__R4SJ9flWlDcC5z4Is/formResponse',
    data: inputs,
    type: 'POST',
    dataType: 'xml',
    statusCode: {
      404: function (xhr, textStatus) {
        var msg = 'Something went wrong. Please <a href="mailto:gc.digitalfellows@gmail.com">email us</a>. <br>Status code: ' + xhr.status + ' message: ' + textStatus;
        var status = 'error';
        showAlert(msg, status);
      },
      0: function () {
        var msg = 'Your application submitted successfully!';
        var status = 'success';
        showAlert(msg, status);
      },
      200: function () {
        var msg = 'Your application submitted successfully!';
        var status = 'success';
        showAlert(msg, status);
        window.location.href = successPage;
      }
    }
  });
}

function showAlert(msg, status) {
  var innerHTML = '<div class="alert alert-' + status + ' alert-dismissible fade in" role="alert">';
  innerHTML += '<button type="button" class="close" data-dismiss="alert" aria-label="Close">';
  innerHTML += '<span aria-hidden="true">&times;</span>';
  innerHTML += '<span class="sr-only">Close</span>';
  innerHTML += '</button>';
  innerHTML += '<strong>' + msg + '</strong></div>';
  $('#submit-status').html(innerHTML);
}

$(document).ready(function () {
  $.fn.validator.Constructor.FOCUS_OFFSET = '60px';

  $('form#google-form').submit(function () {
    postToGoogle();
    return false;
  });

  $('#entry_1459909620').change(function () {
    if ($('#entry_1459909620').val() === 'Other') {
      $('#other-program').removeAttr('hidden');
    } else {
      $('#other-program').attr('hidden', '');
    }
  });

  $('#group_1828641612_8').change(function () {
    if ($('#group_1828641612_8').is(':checked')) {
      $('#other-reference').removeAttr('hidden');
    } else {
      $('#other-reference').attr('hidden', '');
    }
  });

  $('input[name="entry.1552330148"]').change(function () {
    if ($('#group_1552330148_1').is(':checked')) {
      $('#other-commit').attr('hidden', '');
    } else {
      $('#other-commit').removeAttr('hidden');
    }
  });
});
