import { sheetContainer, characterDataCache } from './state.js';

export function displayMutationEffectDescription(selectElement){
    if (!characterDataCache || !characterDataCache.mutations_effects) return;
    const mutationName = selectElement.dataset.mutationName;
    const selectedEffectName = selectElement.value;
    const descriptionDiv = sheetContainer.querySelector(`.mutation-effect-description[data-mutation-name="${mutationName}"]`);
    if (descriptionDiv) {
        if (selectedEffectName) {
            const effectData = characterDataCache.mutations_effects.find(eff => eff.name === selectedEffectName);
            descriptionDiv.innerHTML = effectData ? `<p><i>${effectData.description}</i></p>` : '';
        } else {
            descriptionDiv.innerHTML = '';
        }
    }
}
