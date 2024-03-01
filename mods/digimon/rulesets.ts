import DIGIMON_SETS from './digimon-sets';
function getLearnset(learnset) {
	return learnset.species === this;
}
function correctLearnset(learnset) {
	let corrected = learnset;
	for(const i in learnset.moves) {
		let name = learnset.moves[i];
		corrected.moves[i] = name.replace(/\s/g, "").toLowerCase();
	}
	return corrected;
}
function correctMoveset(moveset) {
	let corrected = moveset;
	for(const i in moveset) {
		let name = moveset[i];
		corrected[i] = name.replace(/\s/g, "").toLowerCase();
	}
	return corrected;
}
//Rulesets
export const Rulesets: {[k: string]: ModdedFormatData} = {
	standard: {
		inherit: true,
		desc: "The standard ruleset for all Digimon tiers",
		ruleset: ['Cancel Mod', 'Dynamax Clause', 'HP Percentage Mod', 'Team Preview', 'Terastal Clause'],
		onBegin() {
		},
		onSwitchIn(pokemon) {
			this.add('-start', pokemon, 'typechange', pokemon.types.join('/'), '[silent]');
		},
		onAfterMega(pokemon) {
			this.add('-start', pokemon, 'typechange', pokemon.types.join('/'), '[silent]');
		},
		onUpdate(pokemon) {
			this.add('-start', pokemon, 'typechange', pokemon.types.join('/'), '[silent]');
		},
		onTeamPreview() {
			const names_used = new Array();
			this.add('', '--DIGIMON TYPES--');
			for(const pokemon of this.getAllPokemon()) {
				const universe = this.dex.species.get(pokemon.species).universe;
				if(universe === 'Pokemon') continue;
				if(!names_used.includes(pokemon.name)) {
					names_used.push(pokemon.name);
					this.add('', `${pokemon.name} `, ` ${pokemon.types.join('/')}`);
				}
			}
		},
		onValidateSet(set) {
			const rule_breaks = new Array();
			const mon = this.dex.species.get(set.species);
			if(mon.universe === 'Digimon') {
				//X-Form not valid as standalone
				if(mon.name.includes("-X")) {
					return[ //Must return, breaks other checks
						`Invalid mon: ${mon.name}.`,
						`Use the base form of this Digimon and equip X-Antibody as held item.`
					];
				}
				//Only X-Antibody as item
				if(set.item && set.item !== 'X-Antibody') {
					rule_breaks.push(
						`Invalid item: ${set.item} on ${mon.name}.`,
						'The only valid item is X-Antibody.'
					);
				}
				//Check move validity
				let moveset = correctMoveset(set.moves);
				let learns = DIGIMON_SETS.find(getLearnset, mon.name);
				learns = correctLearnset(learns);
				for(const i in moveset) {
					if (!learns?.moves.includes(moveset[i])) {
						rule_breaks.push(`Invalid move: ${mon.name} cannot learn ${set.moves[i]}.`);
					}
				}
				//Ability check
				if(set.ability !== mon.abilities[0]) {
					rule_breaks.push(`Invalid ability: ${mon.name}'s ability is ${mon.abilities[0]}, not ${set.ability}.`);
				}
			}
			//Return if rules broken
			if(rule_breaks.length > 0) {
				return rule_breaks;
			}
		},
	},
	standardnext: {
		effectType: 'ValidatorRule',
		name: 'Standard NEXT',
		desc: "Restricted teambuilder for Digimon-only formats",
		onValidateTeam(team) {
			const invalid_mons = new Array();
			for (const set of team) {
				const mon = this.dex.species.get(set.species);
				//Ban all pokemon
				if(mon.universe === 'Pokemon') {
					invalid_mons.push(mon.name);
				}
			}
			if(invalid_mons.length > 0) {
				return [
					`Invalid mons: ${invalid_mons}.`,
					'Pokemon are not allowed in Digimon-only formats.'
				];
			}
		},
	},
};
