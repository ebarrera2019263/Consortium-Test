const app = new Vue({
    delimiters: ['{', '}'],
    el: '#app',
    data: {
        file_location: "",
        filter: 1,
        do_search: false,
        do_edit: false,
        is_litigation: false,
        search_results: [],
        next_result: null,
        back_result: null,
        record_pk: null,
        locations: [
            'ARCHIVO ELECTRÓNICO - [únicamente]',
            'ARCHIVO ELECTRÓNICO - [original se devolvió a cliente]',
            'ARCHIVO ESCRITORIO - [Documentos de consulta frecuente]',
            'ARCHIVO NIVEL 14 - [Documentos de consulta media]',
            'ARCHIVO BODEGA - [Documentos de consulta baja]'
        ]
    },
    filters: {
        lower: function(value){
            return value.toLowerCase();
        }
    },
    mounted() {
        $("#slc_client").select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: "Seleccione un cliente",
            allowClear: true,
        });

        
        $("#slc_user_desktop").select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: "Seleccione un usuario",
            allowClear: true,
        });

        $("#slc_practice_area").select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: "Seleccione un area",
            allowClear: true,
        });

        $("#slc_search_client").select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: "Seleccione un cliente",
            allowClear: true,
        });

        $("#slc_search_user").select2({
            width: '100%',
            theme: 'bootstrap4',
            placeholder: "Seleccione un usuario",
            allowClear: true,
        });

        document.addEventListener('DOMContentLoaded', function(){
            $("#txt_documents_included").select2({
                tags: true,
              });    
        })
    },
    methods: {
        submitInventory(){
            let form = document.getElementById('inventory_create_form');
            let token = document.querySelector('input[name=csrfmiddlewaretoken]').value;
            let formData = new FormData(form);

            toastr.options = {
                positionClass: 'toast-top-center'
            };

            let documents_included = $('#txt_documents_included').val();
            formData.set('documents_included', JSON.stringify(documents_included));

            axios.post('/inventory/create/record/', formData, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': token,
                }
            })
            .then(response => {
                swal({
                    title: 'Registro creado',
                    icon: "success",
                    closeOnClickOutside: false,
                })
                .then((willDelete) => {
                    if(willDelete){           
                        document.getElementById('inventory_create_form').reset();
                        $('#slc_client').val(null).trigger('change');
                        $('#txt_documents_included').val(null).trigger('change');
                        $('#slc_user_desktop').val(null).trigger('change');
                        $('#slc_practice_area').val(null).trigger('change');
                        
                    }
                });
            })
            .catch(error => {
                console.log({error});
            });
        },
        searchRecords(){
            let token = document.querySelector('input[name=csrfmiddlewaretoken]').value;

            let formData = new FormData();

            let params = {};

            // formData.append('filter_selected', this.filter);
            params.filter_selected = this.filter;
            if (this.filter == 1){
                let filter = document.getElementById('slc_search_client').value;
                // formData.append('filter_data', filter);
                params.filter_data = filter
            }
            if (this.filter == 2){
                let filter = document.getElementById('txt_search_expedient').value;
                // formData.append('filter_data', filter);
                params.filter_data = filter
            }
            if (this.filter == 3){
                let filter = document.getElementById('slc_search_user').value;
                // formData.append('filter_data', filter);
                params.filter_data = filter
            }

            axios.get('/search/archive/record/', {
                params: params
            })
            .then(response => {
                
                this.do_search = true;
                this.search_results = response.data.results;
                this.next_result = response.data.next;
                this.back_result = response.data.previous;
                document.getElementById('close_search_modal').click();
            })
            .catch(error => {
                console.log({error});
            })
        },
        previousNextPage(url){
            axios.get(url)
            .then(response => {
                
                this.search_results = response.data.results;
                this.next_result = response.data.next;
                this.back_result = response.data.previous;
            })
            .catch(error => {
                console.log({error})
            })
        },
        getRecordForEdit(pk){
            this.do_edit= true,
            axios.get('/edit/archive/record/', {
                params: {
                    pk: pk
                }
            })
            .then(response => {
                this.record_pk = response.data.id;
                // if (response.data.)
                $('#txt_documents_included').val(null).trigger('change');
                setTimeout(() => {
                    $("#txt_documents_included").select2({
                        tags: true,
                    }); 
                    
                }, 500);  
                if(response.data.user_desktop != null){
                    // this.file_location = 3
                    $('#slc_user_desktop').val(response.data.user_desktop).trigger('change');
                }
                $('#slc_client').val(response.data.client.id).trigger('change');
                document.getElementById('txt_entity').value = response.data.entity;
                document.getElementById('txt_file_name').value = response.data.file_name;
                $('#slc_practice_area').val(response.data.practice_area).trigger('change');
                document.getElementById('txt_reference').value = response.data.reference;
                document.getElementById('slc_file_location').value = response.data.file_location;
                document.getElementById('txt_observations').value = response.data.observations;
                let documents = JSON.parse(response.data.documents_included);
                
                documents.forEach(document => {
                    var newOption = new Option(document, document, true, true);
                    // Append it to the select
                    $('#txt_documents_included').append(newOption).trigger('change');
                })                
            })
        },
        updateRecord(){

            let formData = new FormData();
            let documents_included = $('#txt_documents_included').val();
            formData.set('documents_included', JSON.stringify(documents_included));

            let location = document.getElementById('slc_file_location').value;
            let observations = document.getElementById('txt_observations').value;

            formData.append('file_location', location);
            formData.append('observations', observations);

            if (document.getElementById('slc_file_location').value != 3){
                formData.append('user_desktop', '');
            }

            axios.patch(`/update/archive/record/${this.record_pk}/`, formData)
            .then(response => {
                swal({
                    title: 'Registro editado',
                    icon: "success",
                    closeOnClickOutside: false,
                })
                .then((willDelete) => {
                    if(willDelete){           
                        document.getElementById('inventory_create_form').reset();
                        $('#slc_client').val(null).trigger('change');
                        $('#txt_documents_included').val(null).trigger('change');
                        $('#slc_user_desktop').val(null).trigger('change');
                        $('#slc_practice_area').val(null).trigger('change');
                        this.do_search = false
                        this.do_edit = false
                        this.search_results = []
                        this.record_pk = null;
                    }
                });
                
            })
            .catch(error => {
                console.log({error});
            })
        },
        cancelUpdateRecord(){
            document.getElementById('inventory_create_form').reset();
            $('#slc_client').val(null).trigger('change');
            $('#txt_documents_included').val(null).trigger('change');
            $('#slc_user_desktop').val(null).trigger('change');
            $('#slc_practice_area').val(null).trigger('change');
            this.do_search = false
            this.do_edit = false
            this.search_results = []
            this.record_pk = null;
        },
        submitRecordFile(){
            let formData = new FormData();
            let file = document.getElementById('file_upload_records').files[0];
            let token = document.querySelector('input[name=csrfmiddlewaretoken]').value;

            formData.append('record_file', file);

            document.getElementById('btn_upload_file').classList.add('running');
            document.getElementById('btn_upload_file').setAttribute('disabled', true);

            axios.post('/api/read/record/file/', formData, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': token,
                }
            })
            .then(response => {
                toastr.success('Archivo subido con éxito');
                document.getElementById('close_upload_file_modal').click();
                document.getElementById('btn_upload_file').classList.remove('running');
                document.getElementById('btn_upload_file').removeAttribute('disabled');
            })
            .catch(error => {
                console.log({error});
            })
        },
        deleteRecord(pk, index){
            axios.patch(`/update/archive/record/${pk}/`, {
                state: 0
            })
            .then(response => {
                swal({
                    title: 'Registro eliminado',
                    icon: "success",
                    closeOnClickOutside: false,
                })
                .then((willDelete) => {
                    if(willDelete){           
                        this.search_results.splice(index, 1);
                    }
                });
                
            })
            .catch(error => {
                console.log({error});
            })
        }
    },
})