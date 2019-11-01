let orgDir, initialOrgDir;

async function getOrgDirectory1() {
	const dirSelector = await mainProcess.selectDirectory();
	initialOrgDir = dirSelector.filePaths[0];
	document.getElementById('organizer-path1').value = initialOrgDir || '';
}

async function getOrgDirectory2() {
	const dirSelector = await mainProcess.selectDirectory();
	orgDir = dirSelector.filePaths[0];
	document.getElementById('organizer-path2').value = orgDir || '';
}

async function organizeFiles() {
	nanobar.go(10);

	let extensions = [];
	if (document.getElementById('mp4-org').checked) {
		extensions.push('.mp4');
	}
	if (document.getElementById('mp3-org').checked) {
		extensions.push('.mp3')
	}
	if (document.getElementById('m4a-org').checked) {
		extensions.push('.m4a')
	}
	if (document.getElementById('m4p-org').checked) {
		extensions.push('.m4p')
	}

	if (extensions.length === 0) {
		nanobar.go(0);
		Materialize.toast({
			html: "You haven't specified a file type!",
			displayLength: 3000,
			classes: 'rounded red'
		});
		return;
	}
	if (!orgDir || !initialOrgDir) {
		nanobar.go(0);
		Materialize.toast({
			html: "You haven't specified a directory!",
			displayLength: 3000,
			classes: 'rounded red'
		});
		return;
	}

	document.getElementById('org-search').setAttribute('disabled', '');
	document.getElementById('org-search').innerText = 'Organizing...';

	disableFileTypes();
	disableOptions();

	await getTagsForOrg(initialOrgDir, extensions);

	enableFileTypes();
	enableOptions();
	document.getElementById('org-search').removeAttribute('disabled');
	document.getElementById('org-search').innerText = 'Organize Files';
	nanobar.go(100);
	Materialize.toast({
		html: "Organization Complete!",
		displayLength: 6000
	})
}


async function getTagsForOrg(startPath, filters) {
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
	nanobar.go(60);
	for (let i = 0; i < files.length; i++) {

		const filePath = path.join(startPath, files[i]);
		const stat = await fs.lstat(filePath);

		if (await stat.isDirectory()) {
			await getTagsForOrg(filePath, filters); //RECURSION BABY r/programmerhumor would be proud.

		} else if (filters.indexOf(path.extname(filePath.toLowerCase())) > -1) {
			let tags = await mm.parseFile(filePath);
			tags = tags.common;

			let fileName = filePath.replace(/^.*[\\\/]/g, '');
			// Make sure there's no incompatible characters in the paths
			if (tags.artist) {
				tags.artist = tags.artist.replace(/[^ (&a-zA-Z0-9+]/g, '-');
			}
			if (tags.album) {
				tags.album = tags.album.replace(/[^ (&a-zA-Z0-9+]/g, '-');
			}

			const options = document.getElementsByName('options');

			// Author > Album > Song
			if (options[0].checked) {
				if (tags.artist && tags.album) {
					const destinationPath = `${orgDir}/${tags.artist}/${tags.album}`;
					await moveFile(filePath, destinationPath, fileName, tags);
				} else if (tags.artist) {
					const destinationPath = `${orgDir}/${tags.artist}/Unknown Album`;
					await moveFile(filePath, destinationPath, fileName, tags);

				} else if (tags.album) {
					const destinationPath = `${orgDir}/Unknown Artist/${tags.album}`;
					await moveFile(filePath, destinationPath, fileName, tags);

				} else {
					const destinationPath = `${orgDir}/Unknown Artist/Unknown Album`;
					await moveFile(filePath, destinationPath, fileName, tags);
				}
			}
			// Album > Song
			if (options[1].checked) {
				if (tags.album) {
					const destinationPath = `${orgDir}/${tags.album}`;
					await moveFile(filePath, destinationPath, fileName, tags);

				} else if (tags.artist) {
					const destinationPath = `${orgDir}/Unknown Album/${tags.artist}`;
					await moveFile(filePath, destinationPath, fileName, tags);

				} else {
					const destinationPath = `${orgDir}/Unknown Album`;
					await moveFile(filePath, destinationPath, fileName, tags);
				}
			}

			// Song
			if (options[2].checked) {
				if (document.getElementById('rename-org').checked) {
					await fs.lstat(`${orgDir}/${fileName}/`).then(() => {
						fileName = `${tags.title} (${Math.round(Math.random() * 10) / 10})${path.extname(fileName)}`
					})
				}
				await fs.copyFile(filePath, `${orgDir}/${fileName}`);
			}
		}
	}
}

function disableOptions() {
	document.getElementsByName('options').forEach(elem => elem.setAttribute('disabled', ''));
}

function enableOptions() {
	document.getElementsByName('options').forEach(elem => elem.removeAttribute('disabled'));
}

function disableFileTypes() {
	document.getElementsByName('org-filetypes').forEach(elem => elem.setAttribute('disabled', ''));
}

function enableFileTypes() {
	document.getElementsByName('org-filetypes').forEach(elem => elem.removeAttribute('disabled'));
}

async function moveFile(filePath, destinationPath, fileName, tags) {
	if (document.getElementById('rename-org').checked) {
		if (tags.title) {
			await fs.lstat(destinationPath + '/' + `${tags.title}${path.extname(fileName)}`).then(() => {
				fileName = `${tags.title} (${Math.round(Math.random() * 10) / 10})${path.extname(fileName)}`;
			}).catch(() => {
				fileName = `${tags.title}${path.extname(fileName)}`;
			});
		} else {
			await fs.lstat(destinationPath + '/' + `Unknown Song${path.extname(fileName)}`).then(() => {
				fileName = `Unknown Song (${Math.round(Math.random() * 10) / 10})${path.extname(fileName)}`
			}).catch(() => {
				fileName = `Unknown Song${path.extname(fileName)}`
			});
		}
	}
	fs.access(destinationPath)
		.then(async () => {
			await fs.copyFile(filePath, `${destinationPath}/${fileName}`);
		})
		.catch(async () => {
			await fs.mkdir(destinationPath, {recursive: true});
			await fs.copyFile(filePath, `${destinationPath}/${fileName}`);
		})
}
