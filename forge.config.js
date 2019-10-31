module.exports = {
	packagerConfig: {
		icon: "icons/icon",
	},
	makers: [
		{
			name: '@electron-forge/maker-zip'
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				format: 'ULFO',
				name: 'Media Manager',
				additionalDMGOptions: {
					"title": "Media Manager",
					"icon": "icons/icon.icns",
					"background-color": "#dadada",
					"contents": [
						{ "x": 448, "y": 344, "type": "link", "path": "/Applications" },
						{ "x": 192, "y": 344, "type": "file", "path": "TestApp.app" }
					]
				}
			}
		}
	]
};
