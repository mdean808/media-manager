module.exports = {
	packagerConfig: {
		icon: "icons/icon",
	},
	electronPackagerConfig: {
		"ignore": ["\\.idea"],
	},
	makers: [
		{
			name: '@electron-forge/maker-zip'
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				format: 'ULFO',
				name: 'MediaManager',
				icon: "./icons/icon.icns",
				additionalDMGOptions: {
					"title": "Media Manager",
					"icon": "./icons/icon.icns",
					"background-color": "#dadada",
					"contents": [
						{"x": 448, "y": 344, "type": "link", "path": "/Applications"},
						{"x": 192, "y": 344, "type": "file", "path": "MediaManager.app"}
					]
				}
			}
		},
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				iconUrl: './icons/icon.ico',
				setupIcon: './icons/icon.ico',
				name: 'MediaManager',
				title: 'MediaManager'
			}
		}
	]
};
