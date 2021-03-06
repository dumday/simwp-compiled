var Simwp = (function($){
	var simwp = {};

	simwp.locale = 'en';
	// ajax options
	simwp.set = function(key, val){
		$.ajax({
			url : '.',
			data : {
				key : val
			},
			method : 'POST',
			headers: {
							'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
					}
		});
	};

	simwp.trigger = function(action, options){
		$(document).trigger(action, options);
	};

	simwp.bind = function(action, fn){
		$(document).on(action, fn);
	};

	simwp.view = {};

	simwp.view.noticeRemove = function(s){
		$(s).on('click', function removeNotice(){
			simwp.set('---simwp-removed-notices', this.id.replace('simwp-notice-', ''));
			siwmp.trigger('simwp_notice_removed', [$(this)]);
		});
	};

	simwp.view.lineRemoveButton = function(s){
		$(s).on('click', function removeLine(){
			var row		= $(this).closest('tr'),
				holder = row.parent();
			simwp.trigger('simwp_line_removed', [row, holder]);
			row.remove();
		});
	};

	function addLine(){
		// test trim
		if(this.value.replace(/^\s+|\s+$/g, '') === '') {
			return;
		}

		var id = this.id.replace('simwp-input-lines-edit-', '');
		var currentRow = $(this).parent().parent();
		// create new row
		var row = $('<tr>');
		// add label
		row.html('<td><input class="hidden" name="' + id + '[]" value="' + this.value + '" type="text" readonly> <label> ' + this.value + ' </label></td>');
		// reset input
		this.value = '';
		// add delete button
		var button = $('<button>', {type : 'button' , class : 'delete' }).text('x');

		simwp.view.lineRemoveButton(button);

		$('<td>').append(button).appendTo(row);
		row.insertBefore(currentRow);

		currentRow.closest('table');

		simwp.trigger('simwp_line_added', [row, $(this)]);
	}

	simwp.view.lineAddInput = function(s){
		$(s).on('keydown', function enter(e){
			var code = e.code || e.which;
			if(code === 13){
				e.preventDefault();
				addLine.apply(this);
			}
		});
	};

	simwp.view.lineAddButton = function(s){
		$(s).click(function addLineButton(){
			var id = this.id.replace('simwp-input-lines-button-', '');
			addLine.apply($('#simwp-input-lines-edit-' + id)[0]);
		});
	};

	simwp.view.lines = function(s){
		var lines = $(s);
		simwp.view.lineRemoveButton(lines.find('button.delete'));
		simwp.view.lineAddInput(lines.find('.simwp-input-lines-edit'));
		simwp.view.lineAddButton(lines.find('.simwp-input-lines-button'));
	};

	simwp.view.imageSelect = function(s){
		$(s).click(function pickImage(e){
			var _this = this;
			e.preventDefault();
			var image = wp.media({
				title: 'Upload Image',
				// mutiple: true if you want to upload multiple files at once
				multiple: false
			}).on('select', function(e){
				// This will return the selected image from the Media Uploader, the result is an object
				var uploaded_image = image.state().get('selection').first();
				// We convert uploaded_image to a JSON object to make accessing it easier
				// Output to the console uploaded_image
				// console.log(uploaded_image);
				var image_url = uploaded_image.toJSON().url;
				// Let's assign the url value to the input field
				var parent = $(_this).parent();
				parent.children('img').attr('src', image_url);
				parent.children('input').val(image_url);
				// src, target
				simwp.trigger('simwp_image_selected', [image_url, parent]);
			}).open();
		});
	};

	simwp.view.imageRemove = function(s){
		$(s).click(function removeImage(){
			var parent = $(this).parent(),
				img = parent.children('img');
			img.attr('src', '');
			img.attr('src', '//placehold.it/' + img.width() + 'x' + img.height() + '/ddd/fdfdfd');
			parent.children('input').val('');
			// target
			simwp.trigger('simwp_image_removed', [parent]);
		});
	};

	simwp.view.imagePicker = function(s){
		var images = $(s);

		simwp.view.imageSelect(images.children('button.add'));
		simwp.view.imageRemove(images.children('button.delete'));
	};

	simwp.view.tags = function(s, options){
		options = options || {};
		if($.fn.tagEditor){
			$(s).tagEditor(options);
		}
	};

	simwp.view.colorPicker = function(s){
		if($.fn.wpColorPicker){
			$(s).wpColorPicker();
		}
	};

	function timePad(t){
		if(t < 10){
			return '0' + t;
		}

		return '' + t;
	}

	function defaultDate(){
		var time = new Date(),
			idate = [
				time.getFullYear(),
				timePad(time.getMonth() + 1),
				timePad(time.getDate()),
			];

		return idate.join('-');
	}

	function dateTimePicker(s, options){
		if($.datetimepicker){
			$.datetimepicker.setLocale(simwp.locale);
			$(s).each(function(){
				if($(this).val() == ''){
					options.startDate = defaultDate();
				}

				$(this).datetimepicker(options);
			});
		}
	}

	simwp.view.dateTimePicker = function(s){
		dateTimePicker(s, {
			format:'Y-m-d H:i:s',
			mask : true,
			lazyInit:true,
			step  : 30
		});
	};

	simwp.view.datePicker = function(s){
		dateTimePicker(s, {
			format:'Y-m-d',
			mask : true,
			lazyInit:true,
			timepicker : false,
			step  : 30
		});
	};

	// Install components
	$(function(){
		var bodyLocale = $('body').attr('class').match(/locale-(\w{2})/);

		if(bodyLocale){
			simwp.locale = bodyLocale[1];
		}

		simwp.view.noticeRemove('.notice.is-removable');

		simwp.view.colorPicker('.simwp-color-field');

		simwp.view.tags('.simwp-tags');

		simwp.view.datePicker('.simwp-date-field');

		simwp.view.dateTimePicker('.simwp-datetime-field');

		simwp.view.imagePicker('.simwp-input-image');

		simwp.view.lines('.simwp-input-lines');
	});

	return simwp;
})(jQuery);
