// dataService.js
// Fetch character sheet data from JSON files
export async function fetchCharacterData() {
  const [
    attributes,
    archetypes,
    traits,
    mutations,
    mutationColors,
    mutationEffects
  ] = await Promise.all([
    fetch('../../../json/character_creation/attributes.json').then(r => r.json()),
    fetch('../../../json/character_creation/archetypes.json').then(r => r.json()),
    fetch('../../../json/character_creation/traits.json').then(r => r.json()),
    fetch('../../../json/character_creation/mutations.json').then(r => r.json()),
    fetch('../../../json/character_creation/mutations_colors.json').then(r => r.json()),
    fetch('../../../json/character_creation/mutations_effects.json').then(r => r.json())
  ]);
  return { attributes, archetypes, traits, mutations, mutationColors, mutationEffects };
}
