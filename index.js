/* global ngapp, xelib, fh, modulePath */
//= require ./src/npcNameGenerator.js
//= require ./src/npcTintLayerService.js
//= require ./src/npcHeadPartService.js
//= require ./src/npcVoiceService.js
//= require ./src/npcGenerator.js

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'NPC Generation',
        templateUrl: `${modulePath}/partials/npcGenerationSettings.html`,
        controller: 'npcGenerationSettingsController',
        defaultSettings: {
            names: fh.loadJsonFile(`${modulePath}/defaultNames.json`)
        }
    });
});