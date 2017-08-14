const electron = require('electron');
const remote = electron.remote
const mainProcess = remote.require('./main.js')
var jsmediatags = require('jsmediatags'), path = require('path'), fs = require('fs'), Nanobar = require("./node_modules/nanobar/nanobar.min.js");
var mp4, mp3, m4a, wav, dir, orgDir; 
var filesFound = [];
var selected= 1;
var fileNumber = 0;
function getDirectory() {
	dir = mainProcess.selectDirectory()[0];
	document.getElementById('text-path').value = dir;
	console.log(dir);
}
function getOrgDirectory() {
	orgDir = mainProcess.selectDirectory()[0];
	document.getElementById('text-path').value = orgDir;
	console.log(orgDir);
}

function checkFileTypes() {
	nanobar.go(30);
	var blank = true;
	if (document.getElementById('mp4').checked) {
		mp4 = ".mp4";
		blank = false;
	} 
	if (document.getElementById('mp3').checked) {
		mp3 = ".mp3";
		blank = false;
	}
	if (document.getElementById('m4a').checked) {
		m4a = ".m4a";
		blank = false;
	} 
	if (document.getElementById('wav').checked) {
		wav = ".wav";
		blank = false;
	} 
	if (blank) {
		Materialize.toast("You haven't checked what to search for!", 3000, 'rounded red');
		return;
	}
	nanobar.go(50);
	fromDir(dir, mp4);
	fromDir(dir, mp3);
	fromDir(dir, m4a);
	fromDir(dir, wav);
	nanobar.go(100);
}
function fromDir(startPath, filter){

	if (!filter) {
		return;
	}
	if (!fs.existsSync(startPath)){
		Materialize.toast("You haven't specified a directory!", 3000, 'rounded red');
		console.log("Directory doesn't exist");
		return;
	}
	document.getElementById('match-btn').enabled = true;

	filesFound = [];
	console.log('Searching for ' + filter + ' in ' + startPath +'\\ and reset filesFound');

	var files=fs.readdirSync(startPath);
	for(var i=0;i<files.length;i++){
		var filepath=path.join(startPath,files[i]);

		var stat = fs.lstatSync(filepath);

		if (stat.isDirectory()){
            fromDir(filepath,filter); //recurse
        } else if (filepath.indexOf(filter)>=0) {
        	(function(filepath) {
        		jsmediatags.read(filepath, {
        			onSuccess: function(tag) {
        				filesFound.push({filePath: filepath, duplicate: false});
        				fileNumber++;
        				var fileName = filepath.replace(/^.*[\\\/]/g, '');
        				document.getElementById('file-table-body').innerHTML += '<tr class="centered"><td id="name' + fileNumber + '">'+ fileName + '</td><td id="title' + fileNumber + '">'+ tag.tags.title + '</td><td id="artist' + fileNumber + '">'+ tag.tags.artist + '</td><td id="album' + fileNumber + '">'+ tag.tags.album + '</td><td id="path' + fileNumber + '">'+ filepath + '</td><td><input type="checkbox" class="filled-in purple" id="delete-check' + fileNumber + '" onclick="checkedForDelete(this.id);"/><label for="delete-check' + fileNumber + '"></label></td></tr>';      
        			},
        			onError: function(error) {
        				console.log('Error: ', error.type, error.info);
        			}
        		});
        	})(filepath)
        }
    }
};

function checkedForDelete(tableElement) {
	if (document.getElementById(tableElement).checked){
		selected++;
		document.getElementById('delete-btn').innerHTML = "Delete " + selected + " files";
	} else if (selected > 0){
		selected--;
		document.getElementById('delete-btn').innerHTML = "Delete " + selected + " files";
	} else {
		document.getElementById('delete-btn').innerHTML = "Delete 0 files";
	}
}
function checkAllForDelete() {
	if (document.getElementById('delete-all').checked) {
		for (var i=0; i<=fileNumber; i++) {
			$('#delete-check' + i).prop('checked', true);
			document.getElementById('delete-btn').innerHTML = "Delete " + i + " files";
			selected = fileNumber;
		}
	} else {
		for (var i=0; i<=fileNumber; i++) {
			$('#delete-check' + i).prop('checked', false);
			document.getElementById('delete-btn').innerHTML = "Delete 0 files";
			selected = 0;
		}
	}
}