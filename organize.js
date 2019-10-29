const electron = require('electron');
const mainProcess = electron.remote.require('./main.js');

const mm = require('music-metadata');
const path = require('path');
const fs = require('fs').promises;
const Nanobar = require('nanobar');
const $ = require('jquery');
const Materialize = require('materialize-css');

let mp4, mp3, m4a, m4p, dupDir, orgDir;
let selected = 1;
let fileNumber = 0;
let check1 = 0, check2 = 0, check3 = 0;
let fileAmount = 0;
let nanobar;

$(function () {
	Materialize.Modal.init(document.querySelectorAll('.modal'));
	Materialize.Tabs.init(document.querySelectorAll('.tabs'), {});
	nanobar = new Nanobar();
});

function openMatches() {
	$('#menubar').hide();
	Materialize.Modal.getInstance(document.getElementById('matches')).open();
}

async function getDupDirectory() {
	const dirSelector = await mainProcess.selectDirectory();
	dupDir = dirSelector.filePaths[0];
	document.getElementById('duplicator-path').value = dupDir || '';
	console.log(dupDir);
}

async function getOrgDirectory1() {
	const dirSelector = await mainProcess.selectDirectory();
	orgDir = dirSelector.filePaths[0];
	document.getElementById('organizer-path1').value = orgDir || '';
}

async function getOrgDirectory2() {
	const dirSelector = await mainProcess.selectDirectory();
	orgDir = dirSelector.filePaths[0];
	document.getElementById('organizer-path2').value = orgDir || '';
}

async function checkFileTypes() {
	document.getElementById('dup-search').setAttribute('disabled', '');
	nanobar.go(10);
	let extensions = [];
	if (document.getElementById('mp4').checked) {
		extensions.push('.mp4')
	}
	if (document.getElementById('mp3').checked) {
		extensions.push('.mp3')
	}
	if (document.getElementById('m4a').checked) {
		extensions.push('.m4a')
	}
	if (document.getElementById('m4p').checked) {
		extensions.push('.m4p')
	}
	if (extensions.length === 0) {
		nanobar.go(0);
		Materialize.toast({
			html: "You haven't specified a file type!",
			displayLength: 3000,
			classes: 'rounded red'
		});
		document.getElementById('dup-search').removeAttribute('disabled');
		return;
	}
	if (!dupDir) {
		nanobar.go(0);
		Materialize.toast({
			html: "You haven't specified a directory!",
			displayLength: 3000,
			classes: 'rounded red'
		});
		document.getElementById('dup-search').removeAttribute('disabled');
		return;
	}
	nanobar.go(50);
	const foundFiles = await findDuplicatesInDir(dupDir, extensions);
	let dups = foundFiles.filter(a => foundFiles.reduce((count, b) => count += (b.title === a.title) ? 1 : 0, 0) > 1);
	for (let i = 0; i < dups.length; i++) {
		const fileName = dups[i].filePath.replace(/^.*[\\\/]/g, '');
		document.getElementById('file-table-body').innerHTML += '<tr class="centered">' +
				'<td id="name' + i + '">' + fileName + '</td>' +
				'<td id="title' + i + '">' + dups[i].title + '</td>' +
				'<td id="artist' + i + '">' + dups[i].artist + '</td>' +
				'<td id="album' + i + '">' + dups[i].album + '</td>' +
				'<td id="path' + i + '">' + dups[i].filePath + '</td>' +
				'<td>' +
					'<label for="delete-check' + i + '">' +
						'<input type="checkbox" class="filled-in red" id="delete-check' + i + '" onclick="checkedForDelete(this.id);"/>' +
						'<span></span>' +
					'</label>' +
				'</td>' +
			'</tr>';
	}
	nanobar.go(100);
	// re-enable the search for matches button
	document.getElementById('dup-search').removeAttribute('disabled');
	// make the match button clickable
	document.getElementById('match-btn').removeAttribute('disabled');
	console.log(`${fileNumber} matches found!`);
}

async function findDuplicatesInDir(startPath, filters) {
	// prevent a search without a filter
	if (filters.length === 0) {
		Materialize.toast({
			html: "You haven't specified a file type!",
			displayLength: 3000,
			classes: 'rounded red'
		});
		return;
	}
	//const fileTotal = await getNumberOfFilesInDir(startPath);

	const dirStat = await fs.lstat(startPath);
	// prevent a search without a directory
	if (!dirStat.isDirectory()) {
		Materialize.toast({
			html: "You haven't specified a directory!",
			displayLength: 3000,
			classes: 'rounded red'
		});
		return;
	}
	const files = await fs.readdir(startPath);
	let foundFiles = [];
	nanobar.go(60);
	for (let i = 0; i < files.length; i++) {
		const filepath = path.join(startPath, files[i]);
		const stat = await fs.lstat(filepath);
		if (stat.isDirectory()) {
			foundFiles = foundFiles.concat(await findDuplicatesInDir(filepath, filters)); //RECURSION BABY r/programmerhumor would be proud.
		} else {
			if (filters.indexOf(path.extname(filepath.toLowerCase())) > -1) {
				let tags = await mm.parseFile(filepath);
				if (tags) {
					tags = tags.common;
					tags.filePath = filepath;
					foundFiles.push(tags);
				}
			}
		}
	}
	return foundFiles;
}

function sortTable(n) {
	let table,
		rows,
		switching,
		i,
		x,
		y,
		shouldSwitch,
		dir,
		switchCount = 0;
	table = document.getElementById("dup-table");
	switching = true;
	//Set the sorting direction to ascending:
	dir = "asc";
	/*Make a loop that will continue until
	no switching has been done:*/
	while (switching) {
		//start by saying: no switching is done:
		switching = false;
		rows = table.getElementsByTagName("TR");
		/*Loop through all table rows (except the
		first, which contains table headers):*/
		for (i = 1; i < rows.length - 1; i++) { //Change i=0 if you have the header th a separate table.
			//start by saying there should be no switching:
			shouldSwitch = false;
			/*Get the two elements you want to compare,
			one from current row and one from the next:*/
			x = rows[i].getElementsByTagName("TD")[n];
			y = rows[i + 1].getElementsByTagName("TD")[n];
			/*check if the two rows should switch place,
			based on the direction, asc or desc:*/
			if (dir === "asc") {
				if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
					//if so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			} else if (dir === "desc") {
				if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
					//if so, mark as a switch and break the loop:
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			/*If a switch has been marked, make the switch
			and mark that a switch has been done:*/
			rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
			switching = true;
			//Each time a switch is done, increase this count by 1:
			switchCount++;
		} else {
			/*If no switching has been done AND the direction is "asc",
			set the direction to "desc" and run the while loop again.*/
			if (switchCount === 0 && dir === "asc") {
				dir = "desc";
				switching = true;
			}
		}
	}
}


function getTagsForOrg(startPath, filter) {

	if (!filter) {
		return;
	}
	if (!fs.existsSync(startPath)) {
		Materialize.toast("You haven't specified a directory!", 3000, 'rounded red');
		console.log("Directory doesn't exist");
		return;
	}
	document.getElementById('match-btn').enabled = true;

	var files = fs.readdirSync(startPath);
	for (var i = 0; i < files.length; i++) {

		var filepath = path.join(startPath, files[i]);
		var stat = fs.lstatSync(filepath);

		if (stat.isDirectory()) {
			getTagsForOrg(filepath, filter); //recurse

		} else if (filepath.indexOf(filter) >= 0) {
			(function (filepath) {
				jsmediatags.read(filepath, {
					onSuccess: function (tag) {
						var fileName = filepath.replace(/^.*[\\\/]/g, '');
						console.log(fileAmount);
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
							fileAmount--;
							if (fileAmount <= 0) {
								console.log('complete');
								$('#mp41').prop('disabled', false);
								$('#mp31').prop('disabled', false);
								$('#m4p1').prop('disabled', false);
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
							fileAmount--;
							if (fileAmount <= 0) {
								console.log('complete');
								$('#mp41').prop('disabled', false);
								$('#mp31').prop('disabled', false);
								$('#m4p1').prop('disabled', false);
								$('#m4a1').prop('disabled', false);

								$('#option1').prop('disabled', false);
								$('#option2').prop('disabled', false);
								$('#option3').prop('disabled', false);
							}
						}
						if (check3) {
							fse.ensureDirSync(orgDir)
							fse.copySync(filepath, orgDir + '\\' + fileName);
							fileAmount--;
							if (fileAmount <= 0) {
								console.log('complete');
								$('#mp41').prop('disabled', false);
								$('#mp31').prop('disabled', false);
								$('#m4p1').prop('disabled', false);
								$('#m4a1').prop('disabled', false);

								$('#option1').prop('disabled', false);
								$('#option2').prop('disabled', false);
								$('#option3').prop('disabled', false);
							}
						}
					},
					onError: function (error) {
						console.log('Error:', error.info);
					}
				});
			})(filepath)
		}
	}
};

function checkedForDelete(tableElement) {
	if (document.getElementById(tableElement).checked) {
		selected++;
		document.getElementById('delete-btn').innerHTML = "Delete " + selected + " files";
	} else if (selected > 0) {
		selected--;
		document.getElementById('delete-btn').innerHTML = "Delete " + selected + " files";
	} else {
		document.getElementById('delete-btn').innerHTML = "Delete 0 files";
	}
}

function checkAllForDelete() {
	if (document.getElementById('delete-all').checked) {
		for (var i = 0; i <= fileNumber; i++) {
			$('#delete-check' + i).prop('checked', true);
			document.getElementById('delete-btn').innerHTML = "Delete " + i + " files";
			selected = fileNumber;
		}
	} else {
		for (var i = 0; i <= fileNumber; i++) {
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
	if (document.getElementById('m4p1').checked) {
		m4p = ".m4p1";
		blank = false;
	}
	if (check1 && check2 || check1 && check3 || check2 && check3) {
		organizeType = false;
	} else if (check1 || check2 || check3) {
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
	$('#m4p1').prop('disabled', true);
	$('#m4a1').prop('disabled', true);

	$('#option1').prop('disabled', true);
	$('#option2').prop('disabled', true);
	$('#option3').prop('disabled', true);


	console.log('organizing...');
	if (!fs.existsSync(orgDir)) {
		fs.mkdirSync(orgDir);
	}
	try {
		var recursiveFiles = recursiveReadSync(dupDir);
		fileAmount = recursiveFiles.length
		console.log(fileAmount);
	} catch (err) {
		if (err.errno === 34) {
			console.log('Path does not exist');
		} else {
			//something unrelated went wrong, rethrow
			throw err;
		}
	}
	console.log("Starting...");
	getTagsForOrg(dupDir, '.mp3');
	getTagsForOrg(dupDir, '.m4a');
	getTagsForOrg(dupDir, '.m4p');
	getTagsForOrg(dupDir, '.mp4');

}

function option1() {
	check1 = 1;
	check2 = 0;
	check3 = 0
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
