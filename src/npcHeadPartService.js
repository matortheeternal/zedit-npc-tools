ngapp.service('npcHeadPartService', function(settingsService, progressService) {
    let npcSettings = settingsService.settings.npcGeneration,
        validRaces = {},
        maleHeadParts = {},
        femaleHeadParts = {};

    let headPartNotFoundError = function(race, female, partType) {
        let gender = female ? 'Female' : 'Male',
            message = `No ${partType} found for ${gender} ${race}.`;
        if (npcSettings.headPartErrors) throw new Error(message);
        progressService.progressMessage(message);
    };

    let randomCheck = function(chance) {
        return Math.random() < chance;
    };

    let newHeadPart = function(npc) {
        return xelib.AddArrayItem(npc, 'Head Parts', '', '');
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

    let applyHeadPart = function(npc, race, female, partType) {
        let headParts = getHeadParts(female, partType) || [],
            headPart = headParts.filter(matchesRace(race)).random();
        if (!headPart) return headPartNotFoundError(race, female, partType);
        xelib.WithHandle(newHeadPart(npc), function(element) {
            xelib.SetLinksTo(element, '', headPart);
        });
    };

    // PUBLIC API
    this.loadHeadParts = function() {
        // TODO
    };

    this.generateHeadParts = function(npc, race, female) {
        xelib.RemoveElement(npc, 'Head Parts');
        applyHeadPart(npc, race, female, 'hairs');
        applyHeadPart(npc, race, female, 'eyes');
        if (race !== 'Khajiit')
            applyHeadPart(npc, race, female, 'brows');
        if (race !== 'Argonian' && randomCheck(npcSettings.facialHairChance))
            applyHeadPart(npc, race, female, 'facialHairs');
        if (randomCheck(npcSettings.scarChance))
            applyHeadPart(npc, race, female, 'scars');
    };
});