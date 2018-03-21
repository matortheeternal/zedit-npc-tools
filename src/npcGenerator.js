ngapp.service('npcGenerator', function(settingsService, randomService, npcHeadPartService, npcNameGenerator, npcColorService, npcRaceService, npcVoiceService) {
    let npcSettings = settingsService.settings.npcGeneration;

    let randomInt = randomService.randomInt;
    let weightedInt = randomService.weightedInt;

    let assignGender = function(npc) {
        let female = randomService.randomCheck(npcSettings.femaleChance),
            flags = ["Auto-calc stats", "Unique"];
        if (female) flags.shift('Female');
        xelib.SetEnabledFlags(npc, 'ACBS\\Flags', flags);
        return female;
    };

    let newNpc = function(plugin) {
        let npc = xelib.AddElement(plugin, 'NPC_\\.'),
            {race, raceHeights} = npcRaceService.assignRace(npc),
            female = assignGender(npc);
        return {
            npc: npc,
            race: race,
            female: female,
            raceHeights: raceHeights
        }
    };

    let setWeight = function({npc}) {
        if (npcSettings.skipWeight) return;
        let weight = randomInt(20, 100);
        SetIntValue(npc, 'NAM7', weight);
    };

    let setHeight = function({npc, raceHeights, female}) {
        if (npcSettings.skipHeight) return;
        let height = raceHeights[female ? 'female' : 'male'];
        if (npcSettings.variableHeight) {
            let {heightHigh, heightLow} = npcSettings;
            height += randomInt(heightLow, heightHigh) / 100.0;
        }
        xelib.SetFloatValue(npc, 'NAM6', height);
    };

    let generateHeadParts = function({npc, race, female}) {
        if (npcSettings.skipHeadParts) return;
        npcHeadPartService.generateHeadParts(npc, race, female);
    };

    let generateMorphs = function({npc}) {
        if (npcSettings.skipMorphs) return;
        xelib.WithHandle(xelib.AddElement(npc, 'NAM9'), morphs => {
            xelib.WithEachHandle(xelib.GetElements(morphs), morph => {
                let value = weightedInt(-100, 100, 2);
                xelib.SetFloatValue(morph, '', value / 100.0);
            });
        });
    };

    let generateFaceParts = function({npc}) {
        if (npcSettings.skipFaceParts) return;
        xelib.WithHandle(xelib.AddElement(npc, 'NAMA'), faceParts => {
            xelib.SetIntValue(faceParts, 'Unknown', -1);
            xelib.SetIntValue(faceParts, 'Nose', randomInt(1, 20));
            xelib.SetIntValue(faceParts, 'Eyes', randomInt(1, 20));
            xelib.SetIntValue(faceParts, 'Mouth', randomInt(1, 20));
        });
    };

    let generateColors = function({npc, race, female}) {
        npcColorService.generateColors(npc, race, female);
    };

    let generateName = function({npc, female}) {
        if (npcSettings.skipNaming) return;
        let lastName = randomService.randomCheck(npcSettings.lastNameChance);
        npcNameGenerator.getName(npc, female, lastName)
    };

    let generateVoice = function({npc, race, female}) {
        if (npcSettings.skipVoice) return;
        npcVoiceService.generateVoice(npc, race, female);
    };

    // PUBLIC API
    let generationSteps = [
        setHeight, setWeight, generateHeadParts, generateMorphs,
        generateFaceParts, generateColors, generateName, generateVoice
    ];

    this.generateNpc = function(plugin) {
        let npcInfo = newNpc(plugin);
        generationSteps.forEach(step => step(npcInfo));
    };
});