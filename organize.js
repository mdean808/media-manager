const electron = require('electron');
const remote = electron.remote
const mainProcess = remote.require('./main.js')
const fse = require('fs-extra')
var jsmediatags = require('jsmediatags'), path = require('path'), fs = require('fs'), Nanobar = require("./node_modules/nanobar/nanobar.min.js"), recursiveReadSync = require('recursive-readdir-sync');
var mp4, mp3, m4a, wav, dir, orgDir; 
var selected= 1;
var fileNumber = 0;
var check1 = 0, check2 = 0, check3 = 0;
var fileamount = 0;
function getDirectory() {
	dir = mainProcess.selectDirectory()[0];
	document.getElementById('folder-path').value = dir;
	document.getElementById('text-path').value = dir;
	console.log(dir);
}
function getOrgDirectory() {
	orgDir = mainProcess.selectDirectory()[0];
	document.getElementById('folder-path2').value = orgDir;
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
		nanobar.go(0);
		Materialize.toast("You haven't checked what to search for!", 3000, 'rounded red');
		return;
	}
	nanobar.go(50);
	getTags(dir, mp4);
	getTags(dir, mp3);
	getTags(dir, m4a);
	getTags(dir, wav);
	nanobar.go(100);
}
function getTags(startPath, filter){

	if (!filter) {
		return;
	}
	if (!fs.existsSync(startPath)){
		Materialize.toast("You haven't specified a directory!", 3000, 'rounded red');
		console.log("Directory doesn't exist");
		return;
	}
	document.getElementById('match-btn').enabled = true;


	var files=fs.readdirSync(startPath);
	for(var i=0;i<files.length;i++){
		var filepath=path.join(startPath,files[i]);

		var stat = fs.lstatSync(filepath);

		if (stat.isDirectory()){
            getTags(filepath,filter); //recurse
        } else if (filepath.indexOf(filter)>=0) {
        	(function(filepath) {
        		jsmediatags.read(filepath, {
        			onSuccess: function(tag) {
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

function getTagsForOrg(startPath, filter){

	if (!filter) {
		return;
	}
	if (!fs.existsSync(startPath)){
		Materialize.toast("You haven't specified a directory!", 3000, 'rounded red');
		console.log("Directory doesn't exist");
		return;
	}
	document.getElementById('match-btn').enabled = true;

	var files=fs.readdirSync(startPath);
   	for(var i=0;i<files.length;i++) {

   		var filepath=path.join(startPath,files[i]);
   		var stat = fs.lstatSync(filepath);

   		if (stat.isDirectory()) {
            getTagsForOrg(filepath,filter); //recurse

        } else if (filepath.indexOf(filter)>=0) {
        	(function(filepath) {
        		jsmediatags.read(filepath, {
        			onSuccess: function(tag) {
        				var fileName = filepath.replace(/^.*[\\\/]/g, '');
        				console.log(fileamount);
        				if (tag.tags.artist) {
        					tag.tags.artist = tag.tags.artist.replace(/[^\ \(\&a-zA-Z0-9+]/g, '-');
        				}
        				if (tag.tags.album) {
        					tag.tags.album = tag.tags.album.replace(/[^\ \(\&a-zA-Z0-9+]/g, '-');
        				}
        				if (check1) {
        					if (tag.tags.artist) {
        						fse.ensureDirSync(orgDir + '\\' + tag.tags.artist + '\\')
        					} else {
        						if (tag.tags.album) {
        							fse.copySync(filepath, orgDir + '\\' + 'Unknown' + '\\' + tag.tags.album + '\\' + fileName);
        						} else if (!tag.tags.album) {
        							fse.copySync(filepath, orgDir + '\\' + 'Unknown' + '\\' + fileName);
        						}
        					}
        					if (tag.tags.album) {
        						fse.copySync(filepath, orgDir + '\\' + tag.tags.artist + '\\' + tag.tags.album + '\\' + fileName);
        					} else if (!tag.tags.album) {
        						fse.copySync(filepath, orgDir + '\\' + 'Unknown' + '\\' + tag.tags.artist + '\\' + fileName);
        					} else {
        						fse.copySync(filepath, orgDir + '\\' + 'Unknown' + '\\' + fileName);
        					}
        					fileamount--;
        					if (fileamount <= 0) {
        						console.log('complete');
        						$('#mp41').prop('disabled', false);
        						$('#mp31').prop('disabled', false);
        						$('#wav1').prop('disabled',	false);
        						$('#m4a1').prop('disabled', false);

        						$('#option1').prop('disabled', false);
        						$('#option2').prop('disabled', false);
        						$('#option3').prop('disabled', false);
        					}
        				}
        				if (check2) {
        					fse.ensureDirSync(orgDir + '\\' + tag.tags.album + '\\')
        					if (tag.tags.album) {
        						fse.ensureDirSync(orgDir + '\\' + tag.tags.album + '\\');
        						fse.copySync(filepath, orgDir + '\\' + tag.tags.album + '\\' + fileName);
        					} else if (!tag.tags.album) {
        						fse.ensureDirSync(orgDir + '\\' + 'Unknown' + '\\')
        						fse.copySync(filepath, orgDir + '\\Unknown' + '\\' + fileName);
        					}
        					fileamount--;
        					if (fileamount <= 0) {
        						console.log('complete');
        						$('#mp41').prop('disabled', false);
        						$('#mp31').prop('disabled', false);
        						$('#wav1').prop('disabled',	false);
        						$('#m4a1').prop('disabled', false);

        						$('#option1').prop('disabled', false);
        						$('#option2').prop('disabled', false);
        						$('#option3').prop('disabled', false);
        					}
        				}
        				if (check3) {
        					fse.ensureDirSync(orgDir)
        					fse.copySync(filepath, orgDir + '\\' +  fileName);
        					fileamount--;
        					if (fileamount <= 0) {
        						console.log('complete');
        						$('#mp41').prop('disabled', false);
        						$('#mp31').prop('disabled', false);
        						$('#wav1').prop('disabled',	false);
        						$('#m4a1').prop('disabled', false);

        						$('#option1').prop('disabled', false);
        						$('#option2').prop('disabled', false);
        						$('#option3').prop('disabled', false);
        					}
        				}
        			},
        			onError: function(error) {
        				console.log('Error:', error.info);
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
function organizeFiles() {
	var blank = true;
	var organizeType = false;
	if (document.getElementById('mp41').checked) {
		mp4 = ".mp41";
		blank = false;
	} 
	if (document.getElementById('mp31').checked) {
		mp3 = ".mp31";
		blank = false;
	}
	if (document.getElementById('m4a1').checked) {
		m4a = ".m4a1";
		blank = false;
	} 
	if (document.getElementById('wav1').checked) {
		wav = ".wav1";
		blank = false;
	} 
	if (check1 && check2 || check1 && check3 || check2 && check3) {
		organizeType = false;
	} else if (check1 || check2 || check3){
		organizeType = true;
	}
	if (blank) {
		Materialize.toast("You haven't checked what to search for!", 3000, 'rounded red');
		return;
	}
	if (!organizeType) {
		Materialize.toast("You haven't decided on an Organization Method!", 3000, 'rounded red');
		return;
	}
	$('#mp41').prop('disabled', true);
	$('#mp31').prop('disabled', true);
	$('#wav1').prop('disabled', true);
	$('#m4a1').prop('disabled', true);

	$('#option1').prop('disabled', true);
	$('#option2').prop('disabled', true);
	$('#option3').prop('disabled', true);

	
	console.log('organizing...');
	if (!fs.existsSync(orgDir)){
		fs.mkdirSync(orgDir);
	}
	try {
		var recursiveFiles = recursiveReadSync(dir);
		fileamount = recursiveFiles.length
		console.log(fileamount);
	} catch(err) {
		if(err.errno === 34) {
			console.log('Path does not exist');
		} else {
   	 	//something unrelated went wrong, rethrow 
   	 	throw err;
   	 	}
   	}
   	console.log("Starting...")
	getTagsForOrg(dir,'.mp3');
	getTagsForOrg(dir,'.m4a');
	getTagsForOrg(dir,'.wav');
	getTagsForOrg(dir,'.mp4');

}
function option1() {
	check1 = 1;
	check2 = 0;
	check3 - 0
}
function option2() {
	check1 = 0
	check2 = 1;
	check3 = 0;
}
function option3() {
	check1 = 0;
	check2 = 0;
	check3 = 1;
}
