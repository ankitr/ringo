//setup before functions
var typingTimer;                //timer identifier
var doneTypingInterval = 1000;  //time in ms, 5 second for example

var hostname = "https://7615c55c.ngrok.com";

// VERY TERMPORARY
var project_id = "JtpP1_sDodA0fgpKfoW"; //prompt("Type your Ringo Project ID");
var project_name = "";
var files = [];

var currentFile = "";

var currentData = editor.getValue();

var currentUploadedFileData = "";


loadFiles(); // load the file menu

// need to come up with a better way of asking for project ID


//on keyup, start the countdown
$('#editor').keyup(function(){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

//on keydown, clear the countdown 
$('#editor').keydown(function(){
    clearTimeout(typingTimer);
});

$("#statusTime").text(moment().calendar());

// var contentType ="application/x-www-form-urlencoded; charset=utf-8";

//user is "finished typing," do something
function doneTyping () {
    var code = editor.getValue();

    if (code != currentData) {

    	currentData = code;

	    for (var k = 0; k < files.length; k++) {
	    	var filedata = files[k];
	    	if (filedata.name == currentFile) {
	    		filedata.data = code;
	    	}
	    }

		$.ajax({
			type: 'POST',
			url: hostname+'/update-project-contents',
			data: {"id": project_id, "files": files},
			error: function (err) {
				console.log(err);
			}, 
			success: function (data) {
				console.log(data);

				// $("#statusValue").text("Ready");
			  	// $("#statusTime").text(moment().calendar());

				// $("#outputArea").html("<center>"+ data.fullDeviceEmbedCode +"</center>");


			},
			dataType: "json"
		});

	}


}


function loadFiles() {
	$.ajax({
		type: 'POST',
		url: hostname+'/get-project-contents',
		data: {"id": project_id},
		error: function (err) {
			console.log(err);
		},
		success: function (data) {
			console.log(data);
			data.files.shift();

			files = data.files;


			for (var i = 0; i < data.files.length; i++) {

				console.log(data.files[i].name);

				$("#fileMenu").append('<div name="'+ data.files[i].name +'" onclick=\"javascript: currentFile = $(this).attr(\'name\'); $(\'#fileMenu div\').css({\'background-color\': \'transparent\', \'font-weight\': \'normal\', \'color\': \'black\'}); $(this).css({\'background-color\': \'rgb(14, 101, 227)\', \'font-weight\':\'bold\', \'color\':\'white\'}); updateEditor();\">'+start_and_end(data.files[i].name) + '</div>');
			}

			editor.setValue(files[0].data, -1);
			editor.scrollToLine(0);
			currentFile = files[0].name;

			$.get(hostname+'/get-project-details/'+project_id, function (data) {
				console.log(data)

				project_name = data.project.name;

				$("#appName").text(project_name);
				$("#fileMenu").prepend("<div style=\"margin-top: 5px;\"><b><img height=\"20pt\" style=\"vertical-align:middle;margin-top: -5px;\" src=\"img/folder-icon.svg\" />&nbsp;"+ data.project.name +"</b></div>")
			
				// buildProject();

			});



		},
		dataType: "json"
	});

}



// run the app on the iOS simulator
$("#runButton").click(function() {
	buildProject();

});


// enable keyboard shortcuts
var listener = new window.keypress.Listener();

// use alt-R to do the same thing as the #runButton
listener.simple_combo("alt r", function() {
    // console.log("used keyboard shortcut to start buildProject()");

    buildProject();
});


function buildProject() {
	

	// save files, then build	
	    var code = editor.getValue();

	    // if (code != currentData) {

	    	$("#statusValue").html('<img src="img/loading.gif" />&nbsp;&nbsp;Building');
			$("#outputArea").html('<center><img src="img/Preloader_3.gif" /><br/><br />Building your application...<center>');

	    	// currentData = code;

		    for (var k = 0; k < files.length; k++) {
		    	var filedata = files[k];
		    	if (filedata.name == currentFile) {
		    		filedata.data = code;
		    	}
		    }

			$.ajax({
				type: 'POST',
				url: hostname+'/update-project-contents',
				data: {"id": project_id, "files": files},
				error: function (err) {
					console.log(err);
					console.log("Saving files prior to building...");

					// after successfully saving the files, build for simulator
						$.ajax({
							type: 'POST',
							url: hostname +'/build-project',
							data: {"id": project_id},
							error: function (err) {
								console.log(err);
							}, 
							success: function (data) {
								console.log(data);

								$("#statusValue").text("Ready");
							  	$("#statusTime").text(moment().calendar());

								$("#outputArea").html("<center>"+ data.fullDeviceEmbedCode +"</center>");

								if (data.BUILD_FAILED) {
									$("#statusValue").text("Failed");
									$("#outputArea").text(data.BUILD_FAILED);
									var normalized = ($("#outputArea").text()).split("\n").join("<br />");
									$("#outputArea").html("<div style=\"margin-left: 10px; margin-right: 10px;\"><span style=\"color:red; font-weight:bold;\">BUILD FAILED</span><br /><div>" + normalized + "</div><br /><br /></div>");

								}

							},
							dataType: "json"
						});



				}, 
				success: function (data) {
					console.log(data);


					

				},
				dataType: "json"
			});

		// }





}




$("#fileMenu").click(function() {
	console.log(currentFile);

	console.log($(this).attr("name"));



});


$("#ipaDLButton").click(function() { // download your code from the server
	location.href = (hostname + '/download-project/'+project_id);
});


$("#ULButton").click(function() {
	location.href = "#openModal";
});

$("#GCButton").click(function() {
	location.href = "#gitModal";
});

$("#createProjectButton").click(function() {
	location.href = "#createModal";
});

function updateEditor() {
	for (var j = 0; j < files.length; j++) {
		if (files[j].name == currentFile) {
			editor.setValue(files[j].data, -1);
		}
	}

	editor.scrollToLine(0);
}

// Truncating strings, but Mac style
function start_and_end(str) {
  if (str.length > 36) {
    return str.substr(0, 13) + '...' + str.substr(str.length-7, str.length);
  }
  return str;
}





// handle file upload requests


function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// FileReader.readAsDataURL(Blob|File)

	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
	  output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
	              f.size/1000000, ' MB, last modified: ',
	              f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
	              '</li>');
	}
	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';


	// Read the ZIP file data
	  for (var i = 0, f; f = files[i]; i++) {

	      // Only process zip files.
	      if (!f.type.match('zip.*')) {
	        continue;
	      }

	      var reader = new FileReader();

	      // Closure to capture the file information.
	      reader.onload = (function(theFile) {
	        return function(e) {
	  

	          console.log(e.target.result);
	          currentUploadedFileData = e.target.result;



	            



	        };
	      })(f);

	      // Read in the image file as a data URL.
	      reader.readAsDataURL(f);


	    }

	} // end handleFileSelect function





	document.getElementById('files').addEventListener('change', handleFileSelect, false);



	  	function uploadFile() {
	  		$.ajax({
			    type: 'POST',
			    url: hostname+'/upload-project-zip',
			    data: {"file": currentUploadedFileData},
			    error: function (err) {
			        // console.log(err);
			    }, 
			    success: function (data) {
			        console.log(data);
			        location.href = "#";

			        initializeNewProject(data.uid);

			    },
			    dataType: "json"
			});
	  	}


	  	function gitClone() {
	  		if ($("#gitModal").children("div").children("center").children("#gitCloneURL").val().length > 0) {
	  			console.log("Request to clone to git approved.");

	  			$.ajax({
				    type: 'POST',
				    url: hostname+'/clone-git-project',
				    data: {"url": $("#gitModal").children("div").children("center").children("#gitCloneURL").val()},
				    error: function (err) {
				    	if (err) {
				    		$("#gitModal").children("div").children("center").children("#gitCloneURL").val("There was an error. Try again.");

				    		setTimeout(function() {
				    			$("#gitModal").children("div").children("center").children("#gitCloneURL").val("");
				    			// location.href = "#";
				    		}, 3000);
				    	}
				        // console.log(err);
				    }, 
				    success: function (data) {
				        console.log(data);

				        if (data) {
				        	$("#gitModal").children("div").children("center").children("#gitCloneURL").val("Success!");

				    		setTimeout(function() {
				    			$("#gitModal").children("div").children("center").children("#gitCloneURL").val("");
				    			location.href = "#";

				    			initializeNewProject(data.uid);

				    		}, 3000);

				        }


				    },
				    dataType: "json"
				});	
	  		}	
			
	  	}



	  	function createProject() {
	  		if ($("#createModal").children("div").children("center").children("#createName").val().length > 0) {
	  			console.log("Request to create project approved.")

	  			var templateType = $("#createModal").children("div").children("center").children("#templateName").val();

	  			// console.log()

	  			$.ajax({
				    type: 'POST',
				    url: hostname+'/create-project',
				    data: {"projectName": $("#createModal").children("div").children("center").children("#createName").val(), "template": templateType},
				    error: function (err) {
				    	if (err) {
				    		$("#createModal").children("div").children("center").children("#createName").val("There was an error. Try again.");

				    		setTimeout(function() {
				    			$("#createModal").children("div").children("center").children("#createName").val("");
				    		}, 3000);
				    	}
				        // console.log(err);
				    }, 
				    success: function (data) {
				        console.log(data);

				        if (data) {
				        	$("#createModal").children("div").children("center").children("#createName").val("Success!");

				    		setTimeout(function() {
				    			$("#createModal").children("div").children("center").children("#createName").val("");
				    			location.href = "#";

				    			initializeNewProject(data.uid);

				    		}, 3000);

				        }


				    },
				    dataType: "json"
				});	// end ajax request

	  		}
	  	}


	  	// not actually sure if this works, so far it doesn't seem to do so at all
	  	function initializeNewProject(id) {
	  		project_id = id;
	  		project_name = "";
			files = [];

			currentFile = "";

			currentData = editor.getValue();

			currentUploadedFileData = "";

			$("#fileMenu").html("");


			loadFiles(); // load the file menu with the new updated data
	  	}





