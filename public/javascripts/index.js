var allData = [];
$(document).ready(function () {
    init();
    $("#error").fadeTo(2000, 500).slideUp(500, function () {
        $("#error").alert('close');
    });

    $('#delete').on('show.bs.modal', function (e) {
        //get data-id attribute of the clicked element
        var bookId = $(e.relatedTarget).data('book-id');
        //populate the textbox
        $(e.currentTarget).find('input[name="id"]').val(bookId);
    });

    $('#add').on('show.bs.modal', function (e) {
        //get data-id attribute of the clicked element
        var id = $(e.relatedTarget).data('book-id');
        if (id) {
            var item = null;
            allData.forEach(function (t) {
                if (t.id == id) {
                    item = t;
                    return;
                }
            });
            $(e.currentTarget).find('input[name="id"]').val(item.id);
            $(e.currentTarget).find('input[name="name"]').val(item.name);
            $(e.currentTarget).find('input[name="address"]').val(item.address);
        }
        $(e.currentTarget).find('.modal-title').html(id ? 'Edit Row' : 'Add New Row');
    });
});

function init() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            loadDoc(JSON.parse(this.responseText));
        }
    };
    xhttp.open("GET", "/data", true);
    xhttp.send();
}

function loadDoc(data) {
    allData = data;
    if (data) {
        var columns = [];
        columns.push({key: 'name', sortable: true});
        columns.push({key: 'address', sortable: true});

        columns.push({
            allowHTML: true,
            key: 'Action',
            label: '',
            formatter: function (col) {
                var del = '<button type="button" data-book-id="' + col.data.id + '" class="btn btn-danger" data-toggle="modal" data-target="#delete"> Delete</button>';
                var edit = '<button type="button" data-book-id="' + col.data.id + '" class="btn btn-default" data-toggle="modal" data-target="#add"> Edit</button>';
                return edit + del
            }
        });

        YUI().use('datatable-scroll', function (Y) {
            var table = new Y.DataTable({
                columns: columns,
                data: data,
                scrollable: "y",
                'max-height': "500px",
                width: "100%"
            });
            table.render('#myDataTable');
        });
    }
}