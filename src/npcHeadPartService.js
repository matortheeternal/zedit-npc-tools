ngapp.service('npcHeadPartService', function(settingsService, progressService, pluginInfoService, randomService) {
    let npcSettings = settingsService.settings.npcGeneration,
        validRaces = {},
        ignoreKeys = {},
        maleHeadParts = {},
        femaleHeadParts = {};

    let randomCheck = randomService.randomCheck;

    let headPartNotFoundError = function(race, female, partType) {
        let gender = female ? 'Female' : 'Male',
            message = `No ${partType} found for ${gender} ${race}.`;
        if (npcSettings.headPartErrors) throw new Error(message);
        progressService.progressMessage(message);
    };

    let getEditorIDs = function(rec, path) {
        let editorIDs = [];
        xelib.WithEachHandle(xelib.GetElements(rec, path), function(element) {
            editorIDs.push(xelib.GetValue(element).split(' ')[0]);
        });
        return editorIds;
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
        let newHeadPart = xelib.AddArrayItem(npc, 'Head Parts', '', '');
        xelib.WithHandle(newHeadPart, function(element) {
            xelib.SetLinksTo(element, '', headPart);
        });
    };

    let loadHeadPart = function(headPart, female, partType) {
        let headParts = female ? femaleHeadParts : maleHeadParts;
        if (!headParts.hasOwnProperty(partType)) headParts[partType] = [];
        headParts[partType].push(headPart);
    };

    let getIgnoreKey = function(pnam) {
        if (!ignoreKeys.hasOwnProperty(pnam))
            ignoreKeys[pnam] = `ignoreBeth${pnam.toPascalCase()}`;
        return ignoreKeys[pnam];
    };

    let releaseHeadParts = function(headParts) {
        Object.keys(headParts).forEach(function(key) {
            headParts[key].forEach(xelib.Release);
        });
    };

    // PUBLIC API
    this.loadHeadParts = function() {
        xelib.WithEachHandle(xelib.GetElements(), function(file) {
            let headParts = xelib.GetRecords(file, 'HDPT'),
                filename = xelib.Name(file),
                isBethesdaFile = pluginInfoService.isBethesdaFile(filename);
            xelib.WithEachHandle(headParts, function(headPart) {
                if (!xelib.GetFlag(headPart, 'DATA - Flags', 'Playable')) return;
                let male = xelib.GetFlag(headPart, 'DATA - Flags', 'Male'),
                    pnam = xelib.GetValue(headPart, 'PNAM');
                if (isBethesdaFile && npcSettings[getIgnoreKey(pnam)]) return;
                loadHeadPart(headPart, !male, pnam);
            });
        });
    };

    this.unloadHeadParts = function() {
        releaseHeadParts(maleHeadParts);
        releaseHeadParts(femaleHeadParts);
    };

    this.generateHeadParts = function(npc, race, female) {
        xelib.RemoveElement(npc, 'Head Parts');
        applyHeadPart(npc, race, female, 'Hair');
        applyHeadPart(npc, race, female, 'Eyes');
        if (race !== 'Khajiit')
            applyHeadPart(npc, race, female, 'Eyebrows');
        if (race !== 'Argonian' && randomCheck(npcSettings.facialHairChance))
            applyHeadPart(npc, race, female, 'Facial Hair');
        if (randomCheck(npcSettings.scarChance))
            applyHeadPart(npc, race, female, 'Scar');
    };
});