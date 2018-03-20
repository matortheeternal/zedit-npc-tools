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
            names: fh.loadJsonFile(`${modulePath}/defaultNames.json`),
            facialHairChance: 0.4,
            scarChance: 0.15,
            headPartErrors: false,
            ignoreBethHair: false,
            ignoreBethEyebrows: false,
            ignoreBethEyes: false,
            ignoreBethFacialHair: false,
            skipNaming: false,
            skipHeadParts: false,
            skipHairColor: false,
            skipHeight: false,
            skipWeight: false,
            skipOutfit: false,
            skipLighting: false,
            skipTintLayers: false,
            loadFromMods: true
        }
    });
});