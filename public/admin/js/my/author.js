var Author = {
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
            bootbox.confirm("Bạn có muốn xóa tác giả này không", function (result) {
                if (result == true) {
                    if (id) {
                        $.ajax({
                            type: "GET",
                            url: "/admin/author/remove/" + id,
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

        $("#btnDelAll").click(function () {
            var arrId = [];
            $('.listID:checked').each(function (k, v) {
                var cateID = $(v).val();
                arrId.push(cateID);
            });
            bootbox.confirm("Bạn có muốn xóa danh sách tác giả này không", function (result) {
                if (result == true) {
                    if (arrId) {
                        $.ajax({
                            type: "POST",
                            url: "/admin/author/remove-all",
                            cache: false,
                            dataType: 'json',
                            data: {
                                arrId: arrId
                            },
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
                authorName: {required: true, minlength: 3, maxlength: 255}
            }, messages: {
                authorName: {
                    required: "Vui lòng nhập tên tác giả",
                    minlength: "Tên tác giả tối thiểu 3 ký tự",
                    maxlength: "Tên tác giả tối đa 255 ký tự"
                }
            }
        });
    }
};