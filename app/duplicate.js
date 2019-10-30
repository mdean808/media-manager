let dupDir;
let duplicates = [];
let filesToDelete = [];

$(function () {
	Materialize.Modal.init(document.querySelectorAll('.modal'));
	Materialize.Tabs.init(document.querySelectorAll('.tabs'), {});
	nanobar = new Nanobar();
});

function openMatches() {
	Materialize.Modal.getInstance(document.getElementById('matches')).open();
}

async function getDupDirectory() {
	const dirSelector = await mainProcess.selectDirectory();
	dupDir = dirSelector.filePaths[0];
	document.getElementById('duplicator-path').value = dupDir || '';
	console.log(dupDir);
}

async function checkFileTypes() {
	document.getElementById('dup-search').setAttribute('disabled', '');
	document.getElementById('match-btn').setAttribute('disabled', '');
	document.getElementById('dup-search').innerText = 'Searching...';
	document.getElementById('file-table-body').innerHTML = '';
	filesToDelete = [];
	nanobar.go(10);
	let extensions = [];
	if (document.getElementById('mp4-dup').checked) {
		extensions.push('.mp4')
	}
	if (document.getElementById('mp3-dup').checked) {
		extensions.push('.mp3')
	}
	if (document.getElementById('m4a-dup').checked) {
		extensions.push('.m4a')
	}
	if (document.getElementById('m4p-dup').checked) {
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
		document.getElementById('dup-search').innerText = 'Search for duplicates';
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
		document.getElementById('dup-search').innerText = 'Search for duplicates';
		return;
	}
	nanobar.go(50);
	const foundFiles = await findDuplicatesInDir(dupDir, extensions);
	duplicates = foundFiles.filter(a => foundFiles.reduce((count, b) => count += (b.title === a.title) ? 1 : 0, 0) > 1);
	for (let i = 0; i < duplicates.length; i++) {
		const fileName = duplicates[i].filePath.replace(/^.*[\\\/]/g, '');
		document.getElementById('file-table-body').innerHTML += '<tr class="centered">' +
			'<td id="name-' + i + '">' + fileName + '</td>' +
			'<td id="title-' + i + '">' + duplicates[i].title + '</td>' +
			'<td id="artist-' + i + '">' + duplicates[i].artist + '</td>' +
			'<td id="album-' + i + '">' + duplicates[i].album + '</td>' +
			'<td id="path-' + i + '">' + duplicates[i].filePath + '</td>' +
			'<td>' +
			'<label for="delete-check-' + i + '">' +
			'<input type="checkbox" name="delete-check" class="filled-in red" id="delete-check-' + i + '" onclick="markForDelete(this.id);"/>' +
			'<span></span>' +
			'</label>' +
			'</td>' +
			'</tr>';
	}
	nanobar.go(100);
	// re-enable the search for matches button
	document.getElementById('dup-search').removeAttribute('disabled');
	document.getElementById('dup-search').innerText = 'Search for duplicates';
	// make the match button clickable
	document.getElementById('match-btn').removeAttribute('disabled');
	Materialize.toast({
		html: `Search Complete. ${duplicates.length} duplicates found.`,
		displayLength: 6000
	})
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
		} else if (filters.indexOf(path.extname(filepath.toLowerCase())) > -1) {
			let tags = await mm.parseFile(filepath);
			if (tags) {
				tags = tags.common;
				tags.filePath = filepath;
				foundFiles.push(tags);
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

function markForDelete(elem) {
	if (document.getElementById(elem).checked) {
		filesToDelete.push(duplicates[elem.split('-')[2]]);
		document.getElementById('delete-btn').innerHTML = "Delete " + filesToDelete.length + " files";
		document.getElementById('delete-btn').removeAttribute('disabled');
	} else if (filesToDelete.length > 0) {
		filesToDelete.splice(elem.split('-')[2], 1);
		document.getElementById('delete-btn').innerHTML = "Delete " + filesToDelete.length + " files";
		document.getElementById('delete-btn').removeAttribute('disabled');
	} else {
		document.getElementById('delete-btn').innerHTML = "Delete 0 files";
		document.getElementById('delete-btn').setAttribute('disabled', '');
	}
}

function markAllForDelete() {
	let i;
	if (document.getElementById('delete-all').checked) {
		filesToDelete = duplicates;
		for (i = 0; i <= filesToDelete.length; i++) {
			$('#delete-check-' + i).prop('checked', true);
		}
		document.getElementById('delete-btn').removeAttribute('disabled');
		document.getElementById('delete-btn').innerHTML = "Delete " + filesToDelete.length + " files";
	} else {
		for (i = 0; i <= filesToDelete.length; i++) {
			$('#delete-check-' + i).prop('checked', false);
		}
		filesToDelete = [];
		document.getElementById('delete-btn').innerHTML = "Delete 0 files";
		document.getElementById('delete-btn').setAttribute('disabled', '');
	}
}

async function deleteDuplicates() {
	for (let i = 0; i < filesToDelete.length; i++) {
		await fs.unlink(filesToDelete[i].filePath)
			.then(() => {
				document.getElementById('name-' + i).parentElement.remove();
				duplicates.splice(duplicates.findIndex(dup => dup === filesToDelete[i]), 1)
			})
			.catch((e) => {
				console.log(e);
				const fileName = filesToDelete[i].filePath.replace(/^.*[\\\/]/g, '');
				return Materialize.toast({
					html: `There was an error deleting "${fileName}"`,
					displayLength: 3000,
					classes: 'rounded red'
				})
			});
	}
	Materialize.toast({html: `Deleted ${filesToDelete.length} duplicates.`, displayLength: 5000});
	filesToDelete = [];
	document.getElementById('delete-btn').innerHTML = "Delete 0 files";
	document.getElementById('delete-btn').setAttribute('disabled', '');
	document.getElementsByName('delete-check').forEach(elem => elem.removeAttribute('checked'));
	Materialize.Modal.getInstance(document.getElementById('matches')).close();
}
