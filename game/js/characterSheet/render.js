import { getAttributeDerivedStats, updateAttributeDisplay } from '../character/utils/attributeUtils.js';

// Generates the HTML markup for the character sheet
export function generateCharacterSheetHTML(charData){
    const weapons = charData.weapons && charData.weapons.weapons ?
        Object.values(charData.weapons.weapons).flat() : [];
    const armor = charData.armor || [];
    const psionics = charData.psionics || [];
    const blades = charData.blades || [];
    const archetypes = charData.archetypes || [];
    const attributesConfig = charData.attributes || [];
    const traits = charData.traits || [];
    const mutations = charData.mutations || [];
    const mutationEffects = charData.mutations_effects || [];
    const mutationColors = charData.mutations_colors || [];

    const attributeNames = attributesConfig.length > 0
        ? attributesConfig.map(attr => attr.name)
        : ['Strength', 'Dexterity', 'Vitality', 'Comeliness', 'Intelligence', 'Perception', 'Charisma', 'Psy'];

    return `
        <div class="character-sheet-container">
            <div class="char-sheet-actions-top">
                 <button id="roll-all-attributes-btn" class="sidebar-button">Roll All Attributes</button>
                 <button id="load-char-sheet-btn" class="sidebar-button">Load Character</button>
                 <button id="save-char-sheet-btn" class="sidebar-button">Save Character</button>
            </div>
            <h3 class="character-sheet-title">Character Sheet</h3>
            <div class="char-sheet-section char-sheet-header-info">
                <div class="char-sheet-field"><label for="char-name">Character Name:</label><input type="text" id="char-name" name="char-name"></div>
                <div class="char-sheet-field">
                    <label for="char-archetype">Archetype:</label>
                    <select id="char-archetype" name="char-archetype">
                      <option value="">-- Select Archetype --</option>
                      ${archetypes.map(arch => `<option value="${arch.name}">${arch.name}</option>`).join('')}
                    </select>
                </div>
                <div class="char-sheet-field"><label for="char-level">Level:</label><input type="number" id="char-level" name="char-level" min="1" value="1"></div>
                <div class="char-sheet-field"><label for="char-race">Race:</label><input type="text" id="char-race" name="char-race"></div>
                <div class="char-sheet-field"><label for="char-alignment">Alignment:</label><input type="text" id="char-alignment" name="char-alignment"></div>
            </div>

            <div class="char-sheet-columns">
                <div class="char-sheet-column">
                    <div id="char-attributes" class="char-sheet-section char-sheet-attributes">
                        <h4>Attributes</h4>
                        ${attributeNames.map(attrName => `
                            <div class="attribute-block">
                                <div class="attribute-score-input">
                                    <label>${attrName.toUpperCase()}</label>
                                    <input type="number" class="attr-score" placeholder="Score" data-attr="${attrName.toLowerCase()}" value="50" min="1" max="100">
                                </div>
                                <div class="attribute-derived-stats" id="derived-${attrName.toLowerCase()}">
                                    <!-- Derived stats will be populated here by JS -->
                                </div>
                            </div>
                        `).join('')}
                    </div>
                     <div class="char-sheet-section char-sheet-saving-throws">
                        <h4>Saving Throws</h4>
                         ${['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map(save => `
                            <div class="saving-throw">
                                <input type="checkbox" id="save-prof-${save.toLowerCase()}" class="prof-checkbox">
                                <input type="number" class="save-value" placeholder="+0">
                                <label for="save-prof-${save.toLowerCase()}">${save}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="char-sheet-column">
                    <div class="char-sheet-section char-sheet-combat-stats">
                        <h4>Combat</h4>
                        <div class="combat-stat"><label>Armor Class:</label><input type="number" id="char-ac"></div>
                        <div class="combat-stat"><label>Initiative:</label><input type="text" id="char-initiative"></div>
                        <div class="combat-stat"><label>Speed:</label><input type="text" id="char-speed"></div>
                        <div class="combat-stat"><label>Max HP:</label><input type="number" id="char-max-hp" readonly></div>
                        <div class="combat-stat"><label>Current HP:</label><input type="number" id="char-current-hp"></div>
                        <div class="combat-stat"><label>Hit Dice:</label><input type="text" id="char-hit-dice"></div>
                    </div>
                     <div id="char-skills" class="char-sheet-section char-sheet-skills scrollable-list">
                        <h4>Skills</h4>
                        ${['Acrobatics (Dex)', 'Animal Handling (Wis)', 'Arcana (Int)', 'Athletics (Str)', 'Deception (Cha)', 'History (Int)', 'Insight (Wis)', 'Intimidation (Cha)', 'Investigation (Int)', 'Medicine (Wis)', 'Nature (Int)', 'Perception (Wis)', 'Performance (Cha)', 'Persuasion (Cha)', 'Religion (Int)', 'Sleight of Hand (Dex)', 'Stealth (Dex)', 'Survival (Wis)'].map(skill => {
                            const skillIdBase = `skill-prof-${skill.split(' ')[0].toLowerCase()}`;
                            return `
                            <div class="skill">
                                <input type="checkbox" id="${skillIdBase}" class="prof-checkbox">
                                <input type="number" class="skill-value" placeholder="+0">
                                <label for="${skillIdBase}">${skill}</label>
                            </div>`;
                        }).join('')}
                    </div>
                    <div class="char-sheet-section char-sheet-traits">
                        <h4>Traits (<span id="trait-points-total">10</span> available)</h4>
                        <div id="char-traits-list" class="scrollable-list" style="max-height: 150px;">
                            ${traits.map(trait => `
                              <div class="char-sheet-checkbox-item trait-item">
                                <input type="checkbox" id="trait-${trait.name.toLowerCase().replace(/\s+/g, '-')}" name="trait-${trait.name.toLowerCase().replace(/\s+/g, '-')}" data-cost="${trait.category === 'Advantage' ? trait.cost : 0}"
                                      data-bonus-points="${trait.category === 'Disadvantage' ? trait.bonus_points : 0}">
                                <label for="trait-${trait.name.toLowerCase().replace(/\s+/g, '-')}" title="${trait.description.replace(/"/g, '&quot;')}">${trait.name} (${trait.category === 'Advantage' ? `Cost: ${trait.cost}` : `Bonus: ${trait.bonus_points}`})</label>
                              </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="char-sheet-column">
                    <div class="char-sheet-section"><label for="char-personality">Personality:</label><textarea id="char-personality" rows="2"></textarea></div>
                    <div class="char-sheet-section"><label for="char-ideals">Ideals:</label><textarea id="char-ideals" rows="2"></textarea></div>
                    <div class="char-sheet-section"><label for="char-bonds">Bonds:</label><textarea id="char-bonds" rows="2"></textarea></div>
                    <div class="char-sheet-section"><label for="char-flaws">Flaws:</label><textarea id="char-flaws" rows="2"></textarea></div>
                     <div class="char-sheet-section"><label for="char-features-traits-text">Features & Special Abilities:</label><textarea id="char-features-traits-text" rows="3"></textarea></div>

                    <div class="char-sheet-section char-sheet-equipment">
                        <h4>Equipment</h4>
                        <div class="char-sheet-field">
                            <label for="char-primary-weapon">Primary Weapon:</label>
                            <select id="char-primary-weapon" name="char-primary-weapon">
                                <option value="">-- Select Primary Weapon --</option>
                                ${weapons.map(w => `<option value="${w.name}">${w.name} (${w.category || 'N/A'})</option>`).join('')}
                            </select>
                        </div>
                        <div class="char-sheet-field">
                            <label for="char-secondary-weapon">Secondary Weapon:</label>
                            <select id="char-secondary-weapon" name="char-secondary-weapon">
                                <option value="">-- Select Secondary Weapon --</option>
                                 ${[...blades, ...weapons.filter(w => w.category.toLowerCase().includes('pistol'))].map(w => `<option value="${w.name}">${w.name} (${w.category || 'Blade'})</option>`).join('')}
                            </select>
                        </div>
                         <div class="char-sheet-field">
                            <label for="char-armor">Armor:</label>
                            <select id="char-armor" name="char-armor">
                                <option value="">-- Select Armor --</option>
                                ${armor.map(a => `<option value="${a.name}">${a.name} (${a.category})</option>`).join('')}
                            </select>
                        </div>
                        <label for="char-other-gear">Other Gear:</label>
                        <textarea id="char-other-gear" name="char-other-gear" rows="3"></textarea>
                    </div>

                     <div class="char-sheet-section char-sheet-psionics">
                        <h4>Psionics</h4>
                        <div id="char-psionics-list" class="scrollable-list" style="max-height: 150px;">
                           ${psionics.map(psi => `
                              <div class="char-sheet-checkbox-item">
                                <input type="checkbox" id="psionic-${psi.name.toLowerCase().replace(/\s+/g, '-')}" name="psionic-${psi.name.toLowerCase().replace(/\s+/g, '-')}" data-manacost="${psi.mana_cost}">
                                <label for="psionic-${psi.name.toLowerCase().replace(/\s+/g, '-')}" title="${psi.description.replace(/"/g, '&quot;')} (${psi.effects.join(', ')})">${psi.name} (Cost: ${psi.mana_cost})</label>
                              </div>
                            `).join('')}
                        </div>
                    </div>
                     <div class="char-sheet-section char-sheet-mutations">
                        <h4>Mutations</h4>
                         <div id="char-mutations-list" class="scrollable-list" style="max-height: 150px;">
                            ${mutations.map(mut => `
                              <div class="char-sheet-checkbox-item mutation-item-container">
                                <input type="checkbox" id="mutation-${mut.name.toLowerCase().replace(/\s+/g, '-')}" name="mutation-${mut.name.toLowerCase().replace(/\s+/g, '-')}" data-type="${mut.type}">
                                <label for="mutation-${mut.name.toLowerCase().replace(/\s+/g, '-')}" title="Effects: ${mut.effects.join(', ')}. Drawbacks: ${mut.drawbacks.join(', ')}">${mut.name} (${mut.type})</label>
                                <div class="mutation-details">
                                  <p><strong>Color:</strong> <select class="mutation-color-select" data-mutation-name="${mut.name}">
                                    <option value="">None</option>
                                    ${mutationColors.map(mc => `<option value="${mc.color}">${mc.color}</option>`).join('')}
                                  </select></p>
                                  <p><strong>Effect:</strong> <select class="mutation-effect-select" data-mutation-name="${mut.name}">
                                    <option value="">None</option>
                                    ${mutationEffects.map(me => `<option value="${me.name}" title="${me.description.replace(/"/g, '&quot;')}">${me.name}</option>`).join('')}
                                  </select></p>
                                  <div class="mutation-effect-description" data-mutation-name="${mut.name}"></div>
                                </div>
                              </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
