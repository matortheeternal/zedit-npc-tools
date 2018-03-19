/* global ngapp, fh, modulePath */
ngapp.service('npcNameGenerator', function(settingsService) {
    let names = settingsService.settings.npcGeneration.names;

    let firstNameKey = function(female) {
        return female ? 'FemaleNames' : 'MaleNames';
    };

    let hasFirstName = function(race, female) {
        return names[race] && names[race][firstNameKey(female)];
    };

    let hasFamilyName = function(race) {
        return names.hasOwnProperty(race);
    };

    let hasNamesFor = function(race, female, lastName) {
        return hasFirstName(race, female) || hasFirstName('Shared', female) &&
            !lastName || hasFamilyName(race) || hasFamilyName('Shared');
    };

    let getFirstName = function(race, female) {
        if (!hasFirstName(race, female)) race = 'Shared';
        return names[race][firstNameKey(female)].random();
    };

    let getFamilyName = function(race) {
        if (!hasFamilyName(race)) race = 'Shared';
        return names[race]['FamilyNames'].random();
    };

    // PUBLIC API
    this.getName = function(race, female, lastName = true) {
        if (!hasNamesFor(race, female, lastName)) return race;
        let name = [getFirstName(race, female)];
        if (lastName) name.push(getFamilyName(race));
        return name.join(' ');
    };
});