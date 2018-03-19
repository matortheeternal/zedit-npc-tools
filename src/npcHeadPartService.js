ngapp.service('npcHeadPartService', function(settingsService) {
    let npcSettings = settingsService.settings.npcGeneration,
        validRaces = {},
        maleHeadParts = {
            hairs: [],
            facialHairs: [],
            brows: [],
            eyes: [],
            scars: []
        },
        femaleHeadParts = {
            hairs: [],
            brows: [],
            eyes: [],
            scars: []
        };

    let headPartNotFoundError = function(race, female, partType) {
        let gender = female ? 'Female' : 'Male';
        return new Error(`No ${partType} found for ${gender} ${race}.`);
    };

    let resetHeadParts = function(npc) {
        xelib.RemoveElement(npc, 'Head Parts');
        xelib.AddElement(npc, 'Head Parts');
    };

    let randomCheck = function(chance) {
        return Math.random() < chance;
    };

    let makeNewHeadPart = function(npc, first) {
        return first ?
            xelib.GetElement(npc, 'Head Parts\\[0]') :
            xelib.AddElement(npc, 'Head Parts\\.');
    };

    let getEditorIDs = function(rec, path) {
        let editorIDs = [];
        xelib.WithHandles(xelib.GetElements(rec, path), function(elements) {
            elements.forEach(function(element) {
                editorIDs.push(xelib.GetValue(element).split(' ')[0]);
            });
        });
    };

    let getAllowedRaces = function(headPart) {
        xelib.WithHandle(xelib.GetLinksTo(headPart, 'RNAM'), function(rnam) {
            let key = xelib.EditorID(rnam);
            if (!validRaces.hasOwnProperty(key))
                validRaces[key] = getEditorIDs(rnam, 'FormIDs');
        });
        return validRaces[key];
    };

    let matchesRace = function(race) {
        return function(headPart) {
            return getAllowedRaces(headPart).includes(race);
        };
    };

    let getHeadParts = function(female, partType) {
        return (female ? femaleHeadParts : maleHeadParts)[partType];
    };

    let applyHeadPart = function(npc, race, female, partType, first = false) {
        let headParts = getHeadParts(female, partType);
        if (!headParts) return;
        xelib.WithHandle(makeNewHeadPart(npc, first), function(element) {
            let headPart = headParts.filter(matchesRace(race)).random();
            if (!headPart) throw headPartNotFoundError(race, female, partType);
            xelib.SetLinksTo(element, '', headPart);
        });
    };

    // PUBLIC API
    this.loadHeadParts = function() {
        // TODO
    };

    this.generateHeadParts = function(npc, race, female) {
        resetHeadParts(npc);
        applyHeadPart(npc, race, female, 'hairs', true);
        applyHeadPart(npc, race, female, 'eyes');
        if (race !== 'Khajiit')
            applyHeadPart(npc, race, female, 'brows');
        if (race !== 'Argonian' && randomCheck(npcSettings.facialHairChance))
            applyHeadPart(npc, race, female, 'facialHairs');
        if (randomCheck(npcSettings.scarChance))
            applyHeadPart(npc, race, female, 'scars');
    };
});