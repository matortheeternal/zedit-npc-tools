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
            skinColors: fh.loadJsonFile(`${modulePath}/defaultSkinColors.json`),
            facialHairChance: 0.40,
            scarChance: 0.15,
            vampireChance: 0.02,
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
            skipVoice: false,
            loadFromMods: true
        }
    });
});