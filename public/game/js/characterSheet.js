// Central module for character sheet functionality
import { generateCharacterSheetHTML } from './characterSheet/render.js';
import { calculateAndUpdateHP, rollAllAttributes } from './characterSheet/hp.js';
import { saveCharacterSheetToLocalStorage, loadCharacterSheetFromLocalStorage } from './characterSheet/storage.js';
import { displayMutationEffectDescription } from './characterSheet/utils.js';
import { setState } from './characterSheet/state.js';
import { updateAttributeDisplay } from './character/utils/attributeUtils.js';
import { applyArchetype } from './archetypeUtils.js';
import { updateTraitPoints } from './character/utils/traitUtils.js';

export function initCharacterSheet(container, charData){
    if (!container) {
        console.error('Character sheet container not found.');
        return;
    }

    setState(container, charData);
    container.innerHTML = generateCharacterSheetHTML(charData);

    const attributeInputs = container.querySelectorAll('.attr-score');
    attributeInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            updateAttributeDisplay(e.target.dataset.attr, parseInt(e.target.value), charData.attributes);
            calculateAndUpdateHP();
        });
        updateAttributeDisplay(input.dataset.attr, parseInt(input.value), charData.attributes);
    });

    const levelInput = container.querySelector('#char-level');
    if (levelInput) levelInput.addEventListener('input', calculateAndUpdateHP);

    calculateAndUpdateHP();

    const archetypeSelect = container.querySelector('#char-archetype');
    if (archetypeSelect) {
        archetypeSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                applyArchetype(e.target.value, charData);
                calculateAndUpdateHP();
            }
        });
    }

    const traitCheckboxes = container.querySelectorAll('#char-traits-list .char-sheet-checkbox-item input[type="checkbox"]');
    traitCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTraitPoints);
    });
    updateTraitPoints();

    const mutationEffectSelects = container.querySelectorAll('.mutation-effect-select');
    mutationEffectSelects.forEach(select => {
        select.addEventListener('change', (e) => displayMutationEffectDescription(e.target));
    });

    const rollAttrBtn = container.querySelector('#roll-all-attributes-btn');
    if (rollAttrBtn) rollAttrBtn.addEventListener('click', rollAllAttributes);

    const saveBtn = container.querySelector('#save-char-sheet-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveCharacterSheetToLocalStorage);

    const loadBtn = container.querySelector('#load-char-sheet-btn');
    if (loadBtn) loadBtn.addEventListener('click', loadCharacterSheetFromLocalStorage);
}
