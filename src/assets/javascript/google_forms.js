'use strict';

function postToGoogle() {
    var inputs = $('form#google-form').serializeJSON();
    console.log(inputs);
    $.ajax({
        url: "https://docs.google.com/forms/d/109PlfwGQc0O8NaeRHKv2x3Ic3_N7wuJccApU1fm43Vc/formResponse",
        data: inputs,
        type: "POST",
        dataType: "xml",
        statusCode: {
            0: function () {
                window.location.replace("submitted.html");
            },
            200: function () {
                window.location.replace("submitted.html");
            }
        }
    });
}

$(document).ready(function(){
    $('form#google-form').submit(function() {
        postToGoogle();
        return false;
    });

    $('#entry_1459909620').change(function() {
        if ($('#entry_1459909620').val() === 'Other') {
            $('#other-program').removeAttr('hidden');
        } else {
            $('#other-program').attr('hidden','');
        }
    })

    $('#group_735949125_12').change(function() {
        if ($('#group_735949125_12').is(':checked')) {
            $('#other-interest').removeAttr('hidden');
        } else {
            $('#other-interest').attr('hidden','');
        }
    })

    $('input[name="entry.1552330148"]').change(function() {
        console.log("checked: " + $('input[name="entry.1552330148"]').val())
        if ($('#group_1552330148_1').is(':checked')) {
            $('#other-commit').attr('hidden','');
        } else {
            $('#other-commit').removeAttr('hidden');
        }
    })
});
