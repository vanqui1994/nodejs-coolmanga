var Login = {
    login: function () {
        $(".frmLogin").validate({
            rules: {
                email: {required: {
                        depends: function () {
                            $(this).val($.trim($(this).val()));
                            return true;
                        }
                    }, minlength: 3, maxlength: 255, email: true},
                password: {required: true}
            }, messages: {
                email: {
                    required: "Vui lòng nhập email",
                    email: "Email không đúng định dạng",
                    minlength: "Email tối thiểu 3 ký tự",
                    maxlength: "Email tối đa 255 ký tự"
                },
                password: {
                    required: "Vui lòng nhập mật khẩu"
                }
            }
        });
    },
    register: function () {
        $('.birthday').inputmask({"mask": "9999-99-99"}).datepicker({
            format: 'yyyy-mm-dd'
        });

        $(".formRegister").validate({
            rules: {
                fullname: {required: true, minlength: 3, maxlength: 255},
                birthday: {required: true},
                email: {required: {
                        depends: function () {
                            $(this).val($.trim($(this).val()));
                            return true;
                        }
                    }, minlength: 3, maxlength: 255, email: true},
                password: {required: true, maxlength: 255, minlength: 3},
                rePassword: {required: true, maxlength: 255, minlength: 3, equalTo: "#password"}
            }, messages: {
                fullname: {
                    required: 'Xin vui lòng nhập Họ và Tên.',
                    minlength: 'Họ và tên tối thiểu từ 3 kí tự trở lên.',
                    maxlength: 'Họ và tên tối đa 255 kí tự'
                },
                birthday: 'Vui lòng chọn ngày sinh',
                email: {
                    required: "Vui lòng nhập email",
                    email: "Email không đúng định dạng",
                    minlength: "Email tối thiểu 3 ký tự",
                    maxlength: "Email tối đa 255 ký tự"
                },
                password: {
                    required: "Vui lòng nhập mật khẩu",
                    minlength: "Mật khẩu tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu tối đa 255 ký tự"
                },
                rePassword: {
                    required: "Vui lòng nhập lại mật khẩu",
                    minlength: "Mật khẩu nhập lại tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu nhập lại tối đa 255 ký tự",
                    equalTo: "Password không trùng khớp. Xin vui lòng kiểm tra lại"
                }
            }
        });
        jQuery.extend(jQuery.validator.messages, {
            equalTo: "Password không trùng khớp. Xin vui lòng kiểm tra lại"
        });

        $("#email").blur(function () {
            var email = $("#email").val();
            if (email) {
                $.ajax({
                    url: '/check-email',
                    dataType: 'json',
                    type: 'GET',
                    data: {
                        email: email
                    },
                    success: function (result) {
                        if (result.success == false) {
                            $("#login-origin").prop("disabled", true);
                        } else {
                            $("#login-origin").prop("disabled", false);
                        }
                        $(".rowEmail").append('<label for="email" class="error">' + result.message + '</label>');
                    }
                });
            }
        });


    },
    lostPassword: function () {
        $(".frmLost").validate({
            rules: {
                email: {required: {
                        depends: function () {
                            $(this).val($.trim($(this).val()));
                            return true;
                        }
                    }, minlength: 3, maxlength: 255, email: true}
            }, messages: {
                email: {
                    required: "Vui lòng nhập email",
                    email: "Email không đúng định dạng",
                    minlength: "Email tối thiểu 3 ký tự",
                    maxlength: "Email tối đa 255 ký tự"
                }
            }
        });

        $("#email").blur(function () {
            var email = $("#email").val();
            if (email) {
                $.ajax({
                    url: '/check-email',
                    dataType: 'json',
                    type: 'GET',
                    data: {
                        email: email
                    },
                    success: function (result) {
                        if (result.success == false) {
                            $("#login-origin").prop("disabled", false);
                        } else {
                            $("#login-origin").prop("disabled", true);
                            $(".rowEmail").append('<label for="email" class="error">Email không tồn tại trong hệ thống</label>');
                        }
                    }
                });
            }
        });
    },
    recoveryPassword: function () {
        $(".frmRePass").validate({
            rules: {
                password: {required: true, maxlength: 255, minlength: 3},
                rePassword: {required: true, maxlength: 255, minlength: 3, equalTo: "#password"}
            }, messages: {
                password: {
                    required: "Vui lòng nhập mật khẩu",
                    minlength: "Mật khẩu tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu tối đa 255 ký tự"
                },
                rePassword: {
                    required: "Vui lòng nhập lại mật khẩu",
                    minlength: "Mật khẩu nhập lại tối thiểu 3 ký tự",
                    maxlength: "Mật khẩu nhập lại tối đa 255 ký tự",
                    equalTo: "Password không trùng khớp. Xin vui lòng kiểm tra lại"
                }
            }
        });
    }
};