(function () {
    ("use strict");
    //file upload preview
    $(document).on('change', '.preview', function (e) {
        emptyInputFiled('image-preview-section')
        var file = e.target.files[0];
        var size = ($(this).attr('data-size')).split("x");
        imagePreview(file, 'image-preview-section', size);
        e.preventDefault();
    })

    //EMPTY INPUT FIELD
    function emptyInputFiled(id, selector = 'id', html = true) {
        var identifier = selector === 'id' ? `#${id}` : `.${id}`;
        $(identifier)[html ? 'html' : 'val']('');
    }

    //SINGLE IMAGE PREVIEW METHOD
    function imagePreview(file, id, size) {
        $(`#${id}`).append(
            `<img alt='${file.type}' class="mt-2 rounded  d-block"
             style="width:${size[0]}px;height:${size[1]}px;"
            src='${URL.createObjectURL(file)}'>`
        );
    }

    // Select two
    if (document.querySelector(".js-example-basic-single")) {
        $(document).ready(function () {
            $('.js-example-basic-single').select2();
        });
    }

    // password js
    $(document).on('click', '#toggle-password', function (e) {
        var passwordInput = $("#password-input");
        var passwordFieldType = passwordInput.attr('type');
        if (passwordFieldType == 'password') {
            passwordInput.attr('type', 'text');
            $("#toggle-password").removeClass('fa-duotone fa-eye eye').addClass('fa-duotone fa-eye-slash eye');
        } else {
            passwordInput.attr('type', 'password');
            $("#toggle-password").removeClass('fa-duotone fa-eye-slash eye').addClass('fa-duotone fa-eye eye');
        }
    });


    // Data table are initialized

    $(document).ready(function () {
        let table = $('#myTable').DataTable({
            responsive: true
        });
    });

    // Nice Selecte initialization
    if (document.querySelector(".niceSelect")) {
        $(document).ready(function () {
            $('.niceSelect').niceSelect();
        });
    }

    // Date Picker

    flatpickr("#date_picker_1", {
        mode: "range",
        // minDate: "today",
        dateFormat: "Y-m-d",
    });

    flatpickr("#date_picker_2", {
        // minDate: "today",
        dateFormat: "Y-m-d",
    });


    $(document).ready(function () {
        $('.checkAll').on('click', function () {
            $(this).closest('table').find('tbody :checkbox')
                .prop('checked', this.checked)
                .closest('tr').toggleClass('selected', this.checked);
        });
        $('tbody :checkbox').on('click', function () {
            $(this).closest('tr').toggleClass('selected', this.checked); //Classe de seleção na row

            $(this).closest('table').find('.checkAll').prop('checked', ($(this).closest('table').find('tbody :checkbox:checked').length == $(this).closest('table').find('tbody :checkbox').length)); //Tira / coloca a seleção no .checkAll
        });
    });


}())
