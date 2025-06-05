import { sheetContainer, characterDataCache } from './state.js';
import { updateAttributeDisplay } from '../character/utils/attributeUtils.js';
import { applyArchetype } from '../archetypeUtils.js';
import { updateTraitPoints } from '../character/utils/traitUtils.js';
import { calculateAndUpdateHP } from './hp.js';
import { displayMutationEffectDescription } from './utils.js';

export function saveCharacterSheetToLocalStorage(){
    if (!sheetContainer) return;
    const data = {
        name: sheetContainer.querySelector('#char-name')?.value,
        archetype: sheetContainer.querySelector('#char-archetype')?.value,
        level: sheetContainer.querySelector('#char-level')?.value,
        race: sheetContainer.querySelector('#char-race')?.value,
        alignment: sheetContainer.querySelector('#char-alignment')?.value,
        attributes: {},
        ac: sheetContainer.querySelector('#char-ac')?.value,
        initiative: sheetContainer.querySelector('#char-initiative')?.value,
        speed: sheetContainer.querySelector('#char-speed')?.value,
        maxHp: sheetContainer.querySelector('#char-max-hp')?.value,
        currentHp: sheetContainer.querySelector('#char-current-hp')?.value,
        hitDice: sheetContainer.querySelector('#char-hit-dice')?.value,
        personality: sheetContainer.querySelector('#char-personality')?.value,
        ideals: sheetContainer.querySelector('#char-ideals')?.value,
        bonds: sheetContainer.querySelector('#char-bonds')?.value,
        flaws: sheetContainer.querySelector('#char-flaws')?.value,
        featuresTraitsText: sheetContainer.querySelector('#char-features-traits-text')?.value,
        primaryWeapon: sheetContainer.querySelector('#char-primary-weapon')?.value,
        secondaryWeapon: sheetContainer.querySelector('#char-secondary-weapon')?.value,
        armor: sheetContainer.querySelector('#char-armor')?.value,
        otherGear: sheetContainer.querySelector('#char-other-gear')?.value,
        selectedTraits: [],
        selectedPsionics: [],
        selectedMutations: []
    };

    sheetContainer.querySelectorAll('.attr-score').forEach(input => {
        data.attributes[input.dataset.attr] = input.value;
    });

    sheetContainer.querySelectorAll('#char-traits-list input[type="checkbox"]:checked').forEach(cb => {
        data.selectedTraits.push(cb.id);
    });
    sheetContainer.querySelectorAll('#char-psionics-list input[type="checkbox"]:checked').forEach(cb => {
        data.selectedPsionics.push(cb.id);
    });
    sheetContainer.querySelectorAll('#char-mutations-list .mutation-item-container').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            data.selectedMutations.push({
                id: checkbox.id,
                color: item.querySelector('.mutation-color-select').value,
                effect: item.querySelector('.mutation-effect-select').value
            });
        }
    });

    localStorage.setItem('characterSheetDataV2', JSON.stringify(data));
    alert('Character Sheet Saved!');
}

export function loadCharacterSheetFromLocalStorage(){
    if (!sheetContainer || !characterDataCache) return;
    const savedDataJSON = localStorage.getItem('characterSheetDataV2');
    if (!savedDataJSON) {
        alert('No saved character data found.');
        return;
    }
    const data = JSON.parse(savedDataJSON);

    sheetContainer.querySelector('#char-name').value = data.name || '';
    sheetContainer.querySelector('#char-archetype').value = data.archetype || '';
    sheetContainer.querySelector('#char-level').value = data.level || '1';
    sheetContainer.querySelector('#char-race').value = data.race || '';
    sheetContainer.querySelector('#char-alignment').value = data.alignment || '';

    if (data.attributes) {
        Object.keys(data.attributes).forEach(attrKey => {
            const input = sheetContainer.querySelector(`.attr-score[data-attr="${attrKey}"]`);
            if (input) {
                input.value = data.attributes[attrKey];
                updateAttributeDisplay(attrKey, parseInt(input.value), characterDataCache.attributes);
            }
        });
    }

    sheetContainer.querySelector('#char-ac').value = data.ac || '';
    sheetContainer.querySelector('#char-initiative').value = data.initiative || '';
    sheetContainer.querySelector('#char-speed').value = data.speed || '';
    sheetContainer.querySelector('#char-current-hp').value = data.currentHp || data.maxHp || '';
    sheetContainer.querySelector('#char-hit-dice').value = data.hitDice || '';

    sheetContainer.querySelector('#char-personality').value = data.personality || '';
    sheetContainer.querySelector('#char-ideals').value = data.ideals || '';
    sheetContainer.querySelector('#char-bonds').value = data.bonds || '';
    sheetContainer.querySelector('#char-flaws').value = data.flaws || '';
    sheetContainer.querySelector('#char-features-traits-text').value = data.featuresTraitsText || '';

    sheetContainer.querySelector('#char-primary-weapon').value = data.primaryWeapon || '';
    sheetContainer.querySelector('#char-secondary-weapon').value = data.secondaryWeapon || '';
    sheetContainer.querySelector('#char-armor').value = data.armor || '';
    sheetContainer.querySelector('#char-other-gear').value = data.otherGear || '';

    sheetContainer.querySelectorAll('#char-traits-list input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (data.selectedTraits) data.selectedTraits.forEach(id => {
        const cb = sheetContainer.querySelector(`#${id}`);
        if (cb) cb.checked = true;
    });
    updateTraitPoints();

    sheetContainer.querySelectorAll('#char-psionics-list input[type="checkbox"]').forEach(cb => cb.checked = false);
    if (data.selectedPsionics) data.selectedPsionics.forEach(id => {
        const cb = sheetContainer.querySelector(`#${id}`);
        if (cb) cb.checked = true;
    });

    sheetContainer.querySelectorAll('#char-mutations-list input[type="checkbox"]').forEach(cb => cb.checked = false);
    sheetContainer.querySelectorAll('#char-mutations-list .mutation-color-select').forEach(s => s.value = '');
    sheetContainer.querySelectorAll('#char-mutations-list .mutation-effect-select').forEach(s => s.value = '');
    sheetContainer.querySelectorAll('#char-mutations-list .mutation-effect-description').forEach(d => d.innerHTML = '');

    if (data.selectedMutations) data.selectedMutations.forEach(mutData => {
        const cb = sheetContainer.querySelector(`#${mutData.id}`);
        if (cb) {
            cb.checked = true;
            const container = cb.closest('.mutation-item-container');
            if (container) {
                container.querySelector('.mutation-color-select').value = mutData.color;
                const effectSelect = container.querySelector('.mutation-effect-select');
                effectSelect.value = mutData.effect;
                displayMutationEffectDescription(effectSelect);
            }
        }
    });

    if (data.archetype) {
       applyArchetype(data.archetype, characterDataCache);
    }

    calculateAndUpdateHP();
    alert('Character Sheet Loaded!');
}
