ngapp.service('npcColorService', function(settingsService, randomService) {
    let npcSettings = settingsService.settings.npcGeneration,
        colors = {},
        colorGroups = ['HairColor', 'HighElf', 'DarkElf', 'WoodElf',
                       'Orc', 'Human', 'Redguard', 'Tint'],
        raceSkinColorGroups = {
            'HighElfRace': 'HighElf',
            'DarkElfRace': 'DarkElf',
            'WoodElfRace': 'WoodElf',
            'BretonRace': 'Human',
            'NordRace': 'Human',
            'ImperialRace': 'Human',
            'RedguardRace': 'Redguard',
            'OrcRace': 'Orc',
            'KhajiitRace': 'Tint',
            'ArgonianRace': 'Tint'
        };

    let generateHairColor = function(npc) {
        xelib.SetLinksTo(npc, 'HCLF', colors['HairColor'].random());
    };

    let createTintLayer = function(npc, colors, options) {
        // TODO
    };

    let setTextureLighting = function(npc, color) {
        let qnam = xelib.AddElement(npc, 'QNAM');
        ['Red', 'Green', 'Blue'].forEach(function(key) {
            xelib.SetValue(qnam, key, color[key]);
        });
    };

    let generateSkinColor = function(npc, race, female) {
        let options = npcSettings.skinColors[race];
        if (randomService.randomCheck(options.skipChance)) {
            setTextureLighting(npc, options.base);
        } else {
            let opts = options[female ? 'female' : 'male'],
                colorGroup = raceSkinColorGroups[race],
                color = createTintLayer(npc, colors[colorGroup], opts);
            setTextureLighting(npc, color);
        }
    };

    let generateTintLayers = function(npc, race, female) {
        let gender = female ? 'female' : 'male',
            tintLayers = npcSettings.tintLayers[race][gender];
        tintLayers.forEach(function(options) {
            createTintLayer(npc, colors['Tint'], options);
        });
    };

    // PUBLIC API
    this.loadColors = function() {
        colorGroups.forEach((group) => colors[group] = []);
        xelib.WithEachHandle(xelib.GetRecords(0, 'CLFM'), function(color) {
            let edid = xelib.EditorID(color),
                group = colorGroups.find(function(group) {
                    return edid.includes(group);
                });
            if (group && edid !== 'RedTintPink') colors[group].push(color);
        });
    };

    this.unloadColors = function() {
        Object.keys(colors).forEach(function(key) {
            colors[key].forEach(xelib.Release);
            delete colors[key];
        });
    };

    this.generateColors = function(npc, race, female) {
        generateHairColor(npc);
        generateSkinColor(npc, race, female);
        generateTintLayers(npc, race, female);
    };
});