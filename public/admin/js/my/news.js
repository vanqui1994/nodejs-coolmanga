var News = {
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
            bootbox.confirm("Bạn có muốn xóa bài viết này không", function (result) {
                if (result == true) {
                    if (id) {
                        $.ajax({
                            type: "GET",
                            url: "/admin/news/remove/" + id,
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
            bootbox.confirm("Bạn có muốn xóa danh sách bài viết này không", function (result) {
                if (result == true) {
                    if (arrId) {
                        $.ajax({
                            type: "POST",
                            url: "/admin/news/remove-all",
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
        $(document).ready(function () {

            tinymce.init({
                branding: false,
                selector: "textarea#description",
                height: 400,
                forced_root_block: false,
                plugins: [
                    "autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker",
                    "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
                    "table contextmenu directionality emoticons template textcolor paste textcolor colorpicker textpattern"
                ],
                toolbar1: "newdocument | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect",
                toolbar2: "cut copy paste | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image media code | insertdatetime preview | forecolor backcolor",
                toolbar3: "table | hr removeformat | subscript superscript | charmap emoticons | print fullscreen | ltr rtl | spellchecker | visualchars visualblocks nonbreaking template pagebreak restoredraft code",
                menubar: false,
                //toolbar_items_size: 'small',
                fontsize_formats: "8pt 9pt 10pt 11pt 12pt 13pt 14pt 18pt 24pt 36pt",
                style_formats: [
                    {title: 'Bold text', inline: 'b'},
                    {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
                    {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
                    {title: 'Table styles'},
                    {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
                ],
                file_browser_callback: function (field_name, url, type, win) {
                    if (type == 'image') {
                        $('div#news_image_upload').html('<input type="file" name="newsImage" id="editorImages" class="imageUpload ignore" />');

                        $("#editorImages").Nileupload({
                            action: '/admin/upload',
                            size: '2MB',
                            extension: 'jpg,jpeg,png',
                            progress: $("#editorProgress"),
                            preview: $(".editorImageList"),
                            multi: false,
                            callback: function (returnData) {
                                $('.mce-btn.mce-open').parent().find('.mce-textbox').val(returnData.image);
                            }
                        });

                        $('#editorImages').click();
                    }
                }
            });


            $('body').on('click', '.delete', function () {
                $(this).parents('li').fadeOut('fast', function () {
                    $(this).remove();
                });
            });


            frm = $("#frm");
            frm.validate({
                ignore: '',
                rules: {
                    newsTitle: {required: true, minlength: 3, maxlength: 255},
                    newsContent: {required: true},
                }, messages: {
                    newsTitle: {
                        required: 'Xin vui lòng nhập tiêu đề tin tức.',
                        minlength: 'tiêu đề tin tức tối thiểu từ 3 kí tự trở lên.',
                        maxlength: 'tiêu đề tin tức tối đa 255 kí tự.'
                    },
                    newsContent: 'Xin vui lòng nhập chi tiết bài viết.',
                }
            });
        });
    }
};