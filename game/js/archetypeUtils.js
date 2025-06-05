// archetypeUtils.js
export function applyArchetype(archetypeName, charData) {
  const archetype = charData.archetypes.find(arch => arch.name === archetypeName);
  if (!archetype) return;

  const attributesContainer = document.getElementById('char-attributes');
  const attributesConfig = charData.attributes || [];
  if (attributesContainer) {
    const attrInputs = attributesContainer.querySelectorAll('.attr-score');
    attrInputs.forEach(input => {
      const attrKey = input.dataset.attr.toUpperCase();
      let baseScore = 50;
      if (archetype.attribute_modifiers && archetype.attribute_modifiers[attrKey] !== undefined) {
        input.value = Math.max(1, Math.min(100, baseScore + archetype.attribute_modifiers[attrKey]));
      } else {
        input.value = baseScore;
      }
      // Assuming updateAttributeDisplay is globally available or imported correctly where this is used
      // For now, we'll rely on characterSheet.js to handle its own updateAttributeDisplay calls after this.
      // To be explicit:
      if (window.updateAttributeDisplayForSheet) { // A hypothetical global function if this were truly standalone
          window.updateAttributeDisplayForSheet(input.dataset.attr, parseInt(input.value), attributesConfig);
      } else if (typeof updateAttributeDisplay === 'function') { // if it's imported locally (not the case here)
          updateAttributeDisplay(input.dataset.attr, parseInt(input.value), attributesConfig);
      }
      // Best practice: characterSheet.js should re-trigger updates or this function needs updateAttributeDisplay passed.
      // For now, assuming characterSheet.js handles the UI update after archetype application.

    });
  }

  const featuresTextarea = document.getElementById('char-features-traits-text');
  if (featuresTextarea) {
    let abilitiesText = "";
    if (archetype.special_abilities) {
      abilitiesText += "Special Abilities:\n- " + archetype.special_abilities.join('\n- ') + "\n\n";
    }
    if (archetype.starting_skills) {
      abilitiesText += "Suggested Starting Skills:\n- " + archetype.starting_skills.join('\n- ') + "\n";
    }
    featuresTextarea.value = abilitiesText.trim();
  }

  const skillsContainer = document.getElementById('char-skills');
  if (skillsContainer) {
    const skillCheckboxes = skillsContainer.querySelectorAll('.skill input[type="checkbox"]');
    skillCheckboxes.forEach(checkbox => checkbox.checked = false);

    if (archetype.starting_skills) {
      archetype.starting_skills.forEach(archSkill => {
        const archSkillUpper = archSkill.toUpperCase().trim();
        skillCheckboxes.forEach(checkbox => {
          const label = checkbox.nextElementSibling.nextElementSibling;
          if (label) {
            const skillName = label.textContent.split('(')[0].trim().toUpperCase();
            if (skillName === archSkillUpper) checkbox.checked = true;
          }
        });
      });
    }
  }

  if (archetype.equipment_packages && archetype.equipment_packages.length > 0) {
    const pkg = archetype.equipment_packages[0]; // Default to first package
    const otherGear = document.getElementById('char-other-gear');
    if (otherGear) {
      otherGear.value = `Suggested from ${pkg.name}:\n- ${pkg.items.join('\n- ')}`;
    }
  }
}