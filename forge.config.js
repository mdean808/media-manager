module.exports = {
	packagerConfig: {
		icon: "icons/icon"
	},
	makers: [
		{
			name: '@electron-forge/maker-zip'
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				background: './icons/icon.icns',
				format: 'ULFO'
			}
		},
		{
			name: '@electron-forge/maker-squirrel',
		}
	]
};
