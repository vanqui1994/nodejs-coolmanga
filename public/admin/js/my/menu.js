var Menu = {
    index: function () {
        $(document).ready(function () {
            catalogType = 1;

            no_item = '<tr>' +
                    '<td colspan="3" style="text-align: center;">Hiện tại chưa có danh mục nào</td>' +
                    '</tr>';


            /*++++++ JSTREE +++++++*/
            $('div#catalog-tree').jstree({
                // List of active plugins
                "plugins": [
                    "themes", "ui", "json_data"
                ],
                "themes": {
                    "theme": "default",
                    "dots": true,
                    "icons": false
                },
                "core": {"animation": 300},
                "json_data": {
                    "ajax": {
                        // the URL to fetch the data
                        "url": '/admin/menu/get-child',
                        "type": "post",
                        "data": function (n) {},
                        success: function (result) {

                        }
                    }
                }
            }).bind("select_node.jstree", function (event, data) {
                var selectedObj = data.rslt.obj;
                var parent_id = parseInt(selectedObj.attr('value'));

                var li = selectedObj.find('ul > li');
                if (li.length > 0) {
                    $('#catalog-container').html('');

                    li.each(function (i) {
                        var item = fillData($(this));
                        $('#catalog-container').append(item);
                        $('[rel="tooltip"]').tooltip();
                    });
                } else {
                    $('#catalog-container').html(no_item);
                }

            }).bind("loaded.jstree", function () {
                $('a#root-cat').trigger('click');
            });



            /*++++++ Main Catalog Select +++++++*/
            $('a#root-cat').click(function () {
                if ($('li.main-catalog').length > 0) {
                    $('#catalog-container').html('');
                    $('li.main-catalog').each(function (i) {
                        var item = fillData($(this));
                        $('#catalog-container').append(item);
                    });
                } else {
                    $('#catalog-container').html(no_item);
                }
            });

            /*++++++ Edit Catalog Click +++++++*/

            $(document).on("click", ".btnDel", function () {
                var menuID = $(this).attr('data-id');
                bootbox.confirm("Bạn có muốn xóa menu này không", function (result) {
                    if (result == true && menuID) {
                        $.ajax({
                            url: '/admin/menu/remove',
                            dataType: 'json',
                            type: 'GET',
                            data: {
                                menuID: menuID
                            },
                            success: function (result) {
                                if (result.success) {
                                    return bootbox.alert(result.message, function () {
                                        window.location = window.location
                                    });
                                }
                                return bootbox.alert(result.message);
                            }
                        });
                    }
                });

            });

        });

    },
    add: function () {
        $("#frm").validate({
            ignore: '.ignore',
            rules: {
                menuName: {required: true, minlength: 3, maxlength: 255}
            }, messages: {
                menuName: {
                    required: 'Xin vui lòng nhập tên menu.',
                    minlength: 'Tên menu tối thiểu từ 3 kí tự trở lên.',
                    maxlength: 'Tên menu tối đa 255 kí tự'
                }
            }
        });

        /*+++++++++++ JSTREE +++++++++++*/
        $('div#catalog-tree').jstree({
            // List of active plugins
            "plugins": [
                "themes", "ui", "html_data"
            ],
            "themes": {
                "theme": "default",
                "dots": true,
                "icons": false
            },
            "core": {"animation": 300},
            "html_data": {
                "ajax": {
                    // the URL to fetch the data
                    "url": "/admin/menu/get-child",
                    "type": "post",
                    "dataType": 'json',
                    "data": function (n) {
                        return {
                            type: 'add'
                        };
                    },
                    "success": function (res) {
                    }
                }
            }
        });


    },
    edit: function (parent_id) {
        $("#frm").validate({
            ignore: '.ignore',
            rules: {
                menuName: {required: true, minlength: 3, maxlength: 255}
            }, messages: {
                menuName: {
                    required: 'Xin vui lòng nhập tên menu.',
                    minlength: 'Tên menu tối thiểu từ 3 kí tự trở lên.',
                    maxlength: 'Tên menu tối đa 255 kí tự'
                }
            }
        });

        $('div#catalog-tree').jstree({
            "plugins": [
                "themes", "ui", "html_data",
            ],
            "themes": {
                "theme": "default",
                "dots": true,
                "icons": false
            },
            "core": {"animation": 300, },
            "html_data": {
                "ajax": {
                    "url": "/admin/menu/get-child",
                    "type": "post",
                    "dataType": 'json',
                    "data": function (n) {
                        return {
                            type: 'edit',
                            parent_id: parent_id
                        };
                    },
                    "success": function (res) {
                    }
                }
            }
        })
    }
};

function fillData(selectedObj) {

    var str = selectedObj.attr('rel');
    var arr = str.split('|');
    var data = {};

    var cat_id = selectedObj.attr('id');

    var cat_name = arr[0];
    var cat_slug = arr[1];

    var item = '<tr>' +
            '<td style="text-align: center;">' + cat_name + '</td>' +
            '<td style="text-align: center;">' + cat_slug + '</td>';

    item += '<td style="text-align: center;">';
    item += '<a href="/admin/menu/edit/' + cat_id + '" class="btn btn-info fa fa-pencil action tooltips" data-placement="top" data-original-title="Chỉnh sửa menu"></a>&nbsp;';
    item += '<button type="button" class="btn btn-danger fa fa-trash action tooltips btnDel" data-id="' + cat_id + '" data-placement="top" data-original-title="Xóa tác giả"></button>';
    item += '</td>';
    item += '</tr>';

    return item;
}