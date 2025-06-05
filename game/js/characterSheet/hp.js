import { getAttributeDerivedStats, updateAttributeDisplay } from '../character/utils/attributeUtils.js';
import { sheetContainer, characterDataCache } from './state.js';

export function calculateAndUpdateHP(){
    if (!sheetContainer || !characterDataCache || !characterDataCache.attributes) return;

    const vitInput = sheetContainer.querySelector('.attr-score[data-attr="vitality"]');
    const levelInput = sheetContainer.querySelector('#char-level');
    const maxHpInput = sheetContainer.querySelector('#char-max-hp');
    const currentHpInput = sheetContainer.querySelector('#char-current-hp');

    if (!vitInput || !levelInput || !maxHpInput) {
        console.warn("HP related input fields not found for calculation.");
        return;
    }

    const vitalityScore = parseInt(vitInput.value) || 0;
    const level = parseInt(levelInput.value) || 1;

    const derivedVitStats = getAttributeDerivedStats('vitality', vitalityScore, characterDataCache.attributes);
    const vitalityHpBonus = derivedVitStats.hp_bonus !== undefined ? parseInt(derivedVitStats.hp_bonus) : 0;

    const maxHp = 30 + (level * 5) + vitalityHpBonus;

    maxHpInput.value = maxHp;
    if (!currentHpInput.value || parseInt(currentHpInput.value) > maxHp || parseInt(currentHpInput.value) === 0 && maxHp > 0) {
        currentHpInput.value = maxHp;
    }
}

export function rollAllAttributes(){
    if (!sheetContainer || !characterDataCache || !characterDataCache.attributes) return;
    const attributeInputs = sheetContainer.querySelectorAll('.attr-score');
    attributeInputs.forEach(input => {
        const score = Math.floor(Math.random() * 81) + 20;
        input.value = score;
        updateAttributeDisplay(input.dataset.attr, score, characterDataCache.attributes);
    });
    calculateAndUpdateHP();
}
