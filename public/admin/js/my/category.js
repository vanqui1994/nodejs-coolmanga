var Category = {
    index: function () {
        $('#btnToggleFilterOrder').click(function () {
            $('div#frmFilterOrder').slideToggle();
        });

        $('#selectAllItem').click(function () {
            $('.listID').removeAttr('checked');
            if ($('#selectAllItem:checked').size() > 0) {
                $('.listID').prop('checked', true);
            }

            if ($('.listID:checked').size() > 0) {
                $('.showBtn').fadeIn();
            } else {
                $('.showBtn').fadeOut();
            }
        });

        $('.listID').click(function () {
            if ($('.listID:checked').size() > 0) {
                $('.showBtn').fadeIn();
            } else {
                $('.showBtn').fadeOut();
            }
        });

        $(".btnDel").click(function () {
            var id = $(this).attr('data-id');
            bootbox.confirm("Bạn có muốn xóa thể loại này không", function (result) {
                if (result == true) {
                    if (id) {
                        $.ajax({
                            type: "GET",
                            url: "/admin/category/remove/" + id,
                            cache: false,
                            dataType: 'json',
                            beforeSend: function () {},
                            success: function (data) {
                                if (data.error) {
                                    bootbox.alert(data.message);
                                } else {
                                    window.location.reload();
                                }
                            }
                        });
                    }
                }
            });
        });
    },
    add: function () {
        $("#frm").validate({
            rules: {
                categoryTitle: {required: true, minlength: 3, maxlength: 255},
                siteTitle: {required: true, minlength: 3, maxlength: 255}
            }, messages: {
                categoryTitle: {
                    required: "Vui lòng nhập tên thể loại",
                    minlength: "Tên thể loại tối thiểu 3 ký tự",
                    maxlength: "Tên thể loại tối đa 255 ký tự"
                },
                siteTitle: {
                    required: "Vui lòng nhập tiêu đề thể loại",
                    minlength: "Tiêu đề thể loại tối thiểu 3 ký tự",
                    maxlength: "Tiêu đề thể thể loại tối đa 255 ký tự"
                }
            }
        });
    }
};