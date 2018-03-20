ngapp.service('npcColorService', function(settingsService, randomService) {
    let npcSettings = settingsService.settings.npcGeneration,
        colors = {},
        colorKeys = ['Red', 'Green', 'Blue'],
        colorGroups = ['HairColor', 'HighElf', 'DarkElf', 'WoodElf',
                       'Orc', 'Human', 'Redguard', 'Tint'];

    let generateHairColor = function(npc) {
        xelib.SetLinksTo(npc, 'HCLF', colors['HairColor'].random());
    };

    let findColor = function(colors, search) {
        if (!search) return colors.random();
        return colors.filter(function(color) {
            return color.edid.includes(search);
        }).random();
    };

    let getColor = function(colors, search) {
        let color = findColor(colors, search);
        if (!color) throw new Error(`Could not find color matching ${search}`);
        return {
            'Red': xelib.GetValue(color.handle, 'CNAM\\Red'),
            'Green': xelib.GetValue(color.handle, 'CNAM\\Green'),
            'Blue': xelib.GetValue(color.handle, 'CNAM\\Blue')
        };
    };

    let setTintLayerColor = function(layer, color) {
        colorKeys.forEach(function(key) {
            xelib.SetValue(layer, `TINC\\${key}`, color[key]);
        });
    };

    let createTintLayer = function(npc, colors, options) {
        if (randomService.randomCheck(options.skipChance)) return;
        let index = options.index.toString(),
            layer = xelib.AddArrayItem(npc, 'Tint Layers', 'TINI', index),
            color = getColor(colors, options.search),
            tinv = randomService.randomInt(options.minTinv, options.maxTinv);
        setTintLayerColor(layer, color);
        xelib.SetIntValue(layer, 'TINV', tinv);
        return color;
    };

    let setTextureLighting = function(npc, color) {
        let qnam = xelib.AddElement(npc, 'QNAM');
        colorKeys.forEach((key) => xelib.SetValue(qnam, key, color[key]));
    };

    let generateSkinColor = function(npc, race, female) {
        let options = npcSettings.skinColors[race];
        if (randomService.randomCheck(options.skipChance)) {
            setTextureLighting(npc, options.base);
        } else {
            let opts = options[female ? 'female' : 'male'],
                colors = options.colorGroup,
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
            if (group && edid !== 'RedTintPink') colors[group].push({
                edid: edid,
                handle: color
            });
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