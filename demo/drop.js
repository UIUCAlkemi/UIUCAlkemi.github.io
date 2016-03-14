
(function() {
    var dropzone = document.getElementById('dropzone');
    //When the file is hovering over the dragzone
    dropzone.ondragover = function() {
      this.className = 'dropzone dragover';
      return false;
    }
    //When the file leaves the dragzone
    dropzone.ondragleave = function() {
      this.className = 'dropzone';
      return false;
    }
    //Drop the file in the zone
    dropzone.ondrop = function(e) {
      e.preventDefault();
      this.className = 'dropzone';
      if(e.dataTransfer.files.length > 1)
        alert("Please upload one json file at a time");
      else
        upload(e.dataTransfer.files[0]);
    }

    var upload = function(file) {
      var formData = new FormData();
      var xhr = new XMLHttpRequest();
      
      formData.append('file[]', file);

      xhr.onload = function() {
        var data = this.responseText;
        console.log(data);
        //remove all elements from the canvass
        d3.select("svg").remove();
        //redraw the canvass
        show();
      }
      xhr.open('post', 'upload.php');
      xhr.send(formData);
    }
  }());
