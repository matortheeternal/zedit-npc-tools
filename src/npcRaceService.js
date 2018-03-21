ngapp.service('npcRaceService', function(settingsService, randomService) {
    let npcSettings = settingsService.settings.npcGeneration,
        races = [];

    let getRandomRace = function() {
        let race = races.random(),
            vampiric = randomService.randomCheck(npcSettings.vampireChance);
        return {
            race: vampiric ? race.vampiric : race.handle,
            raceEdid: race.edid
        };
    };

    // PUBLIC API
    this.assignRace = function(npc) {
        let {race, raceEdid} = getRandomRace();
        xelib.SetLinksTo(npc, 'RNAM', race);
        return {
            race: raceEdid,
            raceHeights: {
                female: xelib.GetFloatValue(race, 'DATA\\Female Height'),
                male: xelib.GetFloatValue(race, 'DATA\\Male Height')
            }
        }
    };

    this.loadRaces = function() {
        // TODO
    };
});