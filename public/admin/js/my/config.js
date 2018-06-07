$(document).ready(function () {
    $('body').on('click', '.delete', function () {
        $(this).parents('li').fadeOut('fast', function () {
            $(this).remove();
        });
    });

    $("#frm").validate({
        rules: {
            email: {required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                }, minlength: 3, maxlength: 255, email: true},
            configTitle: {required: true},
            configFooter: {required: true},
            configFanPage: {required: true},
            configSummary: {required: true, minlength: 3, maxlength: 255}
        }, messages: {
            email: {
                required: "Vui lòng nhập email",
                email: "Email không đúng định dạng",
                minlength: "Email tối thiểu 3 ký tự",
                maxlength: "Email tối đa 255 ký tự"
            },
            configTitle: {
                required: "Vui lòng nhập tên website"
            },
            configFooter: {
                required: "Vui lòng nhập thông tin Footer"
            },
            configFanPage: {
                required: "Vui lòng nhập code fanpage"
            },
            configSummary: {
                required: "Vui lòng nhập miêu tả website",
                minlength: "Miêu tả website tối thiểu 3 ký tự",
                maxlength: "Miêu tả website tối đa 255 ký tự"
            }
        }
    });

    $("#logoImage").Nileupload({
        action: '/admin/upload',
        size: '150KB',
        extension: 'jpg,jpeg,png',
        progress: $("#progress"),
        preview: $(".logoImageList"),
        multi: false
    });
});