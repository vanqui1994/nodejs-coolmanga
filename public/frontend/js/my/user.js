var User = {
    changePassword: function () {
        $("#frm").validate({
            rules: {
                password: {required: true, maxlength: 255, minlength: 3},
                newPassword: {required: true, maxlength: 255, minlength: 3},
                reNewPassword: {required: true, maxlength: 255, minlength: 3, equalTo: "#newPassword"}
            }, messages: {
                password: {
                    required: "Vui lòng nhập mật khẩu cũ",
                    minlength: "Mật khẩu cũ tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu cũ tối đa 255 ký tự"
                },
                newPassword: {
                    required: "Vui lòng nhập mật khẩu mới",
                    minlength: "Mật khẩu mới tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu mới tối đa 255 ký tự"
                },
                reNewPassword: {
                    required: "Vui lòng nhập lại mật khẩu mới",
                    minlength: "Mật khẩu nhập lại tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu nhập lại tối đa 255 ký tự",
                    equalTo: "Mật khẩu mới không trùng khớp. Xin vui lòng kiểm tra lại"
                }
            }
        });
        jQuery.extend(jQuery.validator.messages, {
            equalTo: "Mật khẩu mới không trùng khớp. Xin vui lòng kiểm tra lại"
        });
        
        $("#password").blur(function () {
            var password = $("#password").val();
            if (password) {
                $.ajax({
                    url: '/check-pass',
                    dataType: 'json',
                    type: 'GET',
                    data: {
                        password: password
                    },
                    success: function (result) {
                        if (result.success == false) {
                            $(".btnChange").prop("disabled", true);
                            $("#rowPass").append('<label for="password" class="error">'+result.message+'</label>');
                        } else {
                            $(".btnChange").prop("disabled", false);
                        }
                    }
                });
            }
        });
    }
};