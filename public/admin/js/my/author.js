var Author = {
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