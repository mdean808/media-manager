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
				format: 'ULFO'
			}
		}
	]
};
