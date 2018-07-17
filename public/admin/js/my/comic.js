var Comic = {
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

            $("#comicImage").Nileupload({
                action: '/admin/upload',
                size: '150KB',
                extension: 'jpg,jpeg,png',
                progress: $("#progress"),
                preview: $(".logoImageList"),
                multi: false
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
                    comicTitle: {required: true, minlength: 3, maxlength: 255}
                }, messages: {
                    comicTitle: {
                        required: 'Xin vui lòng nhập tên truyện.',
                        minlength: 'Tên truyện tối thiểu từ 3 kí tự trở lên.',
                        maxlength: 'Tên truyến tối đa 255 kí tự.'
                    }
                }
            });

            $(".btnGrab").click(function () {
                var url = $('#urlDestination').val();
                if (url) {
                    $.ajax({
                        type: "POST",
                        url: "/admin/comic/grab",
                        cache: false,
                        dataType: 'json',
                        data: {
                            url: url
                        },
                        beforeSend: function () {
                            $('#urlDestination').prop("disabled", true);
                            $("#loading").show();
                        },
                        success: function (data) {
                            $('#urlDestination').prop("disabled", false);
                            $("#loading").hide();
                            if (data.success == 1) {
                                var dataCategory = data.data.categoryList;
                                $("#comicTitle").val(data.data.title);
                                if (dataCategory) {
                                    $(".checkbox").each(function (e) {
                                        var temp = $(this);
                                        temp.prop("checked", false);
                                        var dataName = temp.attr('data-name');
                                        if (typeof dataName != 'undefined') {
                                            dataCategory.forEach(function (e) {
                                                if (dataName == e) {
                                                    temp.prop("checked", true);
                                                }
                                            });
                                        }
                                    });
                                }
                                $("#comicAuthor").importTags(data.data.author);
                                tinymce.activeEditor.setContent(data.data.content);
                                $(".logoImageList").html('<ul class="logoImageList" style="margin-left: 0px; margin-top: 10px;"><li style="background: none repeat scroll 0 0 #FFFFFF;border: 1px solid #DDDDDD;border-radius: 2px 2px 2px 2px;box-shadow: 1px 1px 2px #EEEEEE;float: left;margin: 0 5px 5px 0;padding: 5px;list-style:none outside none;margin-bottom:10px;display:inline;"><img class="image" src="' + data.data.image + '" style="width:116px;height:116px"><span style="display: block;text-align: right;"><a title="Xem" class="view colorbox" href="' + data.data.image + '" target="_blank" style="vertical-align: middle;cursor: pointer;display: inline-block;height: 16px;margin-left: 5px;opacity: 0.5;vertical-align: middle;width: 16px;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWJJREFUeNqk00soRFEcx/Ez4yIhWSClWNiR0mQjeawssJGVLJTMBnksJNnZeWTDRnntZGdhoWxsJERK2UgTK5mFYrzSXN9TPzVzulPkX5/unXPv/M45/3tvKBqNGpWHRkygFUW4xR5WcWUCKqxjDsZxiA684w55GMIpBhEKCrCD7ZjDK5ZQi0pUYwofWkVXUICdZRI+VnQe13UbOI9p/R5DuRuQiybEMGuCa03ba0OpG+Dp3C7zOUOAvfaY0uy0ANuwN60kx2SuYm3pxQ34xC4qMJzhzz1owQbu3QC7vGVkYwYjms2owb1YRBKbWoUxzn5ONLu9cQF9eECJHmmBVtqJayR+ArIikYhR+gWO1eV61Gl8y96n96IZ+ThSYFpHv3CAc5SpqU96I6uwDTvbKAp1THhOs5J6ieLO+I0auYMGDOhb6Q+b31dMIWcpT6bGM38ru51urGMflyHf981/6luAAQBAI081YdVfOQAAAABJRU5ErkJggg==);"></a><a title="Xóa" class="delete" style="vertical-align: middle;cursor: pointer;display: inline-block;height: 16px;margin-left: 5px;opacity: 0.5;vertical-align: middle;width: 16px;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAK1JREFUeNpi/P//PwMySE9PPwmkzBgwwZqZM2eGogsyYVGITTMIhGATZMGhWA9o22UkV9kAqcPYFDKmpaU9AdLSDKSDrUBLfEBeeM1AAWCEBSLQmR+AFD8Q+wDxFphXgPgSlA0TfwS0WR5fIB6BMZDDAVmcUCyQBKhqACelBrANuBdgQAgpBcohiYsSMuARlL6HJPYQiX0bSn/EZUAukiG4wH0gLsOaEskFAAEGAE+1LkibLuYpAAAAAElFTkSuQmCC);"></a><div class="jsonData jsonDatacomicImage-0"><input name="comicImage" type="hidden" value="' + data.data.image + '"></div></span></li></ul>');
                            } else {
                                bootbox.alert(data.message);
                            }

                        }
                    });
                }
            });
        });
    }
};