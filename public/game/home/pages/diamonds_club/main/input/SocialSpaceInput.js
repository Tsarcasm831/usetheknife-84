/**
 * Mixin for input handling logic
 * Moves keyboard/mouse handler methods out of the main class.
 */
export default function applyInput(instance) {
  instance.setupInputHandlers = function() {
    document.addEventListener('keydown', instance.onKeyDown);
    document.addEventListener('keyup', instance.onKeyUp);
    window.addEventListener('mousedown', instance.onMouseDown);
    window.addEventListener('mouseup', instance.onMouseUp);
    window.addEventListener('wheel', instance.onMouseWheel);
    document.addEventListener('contextmenu', (event) => {
      if (instance.controls.isLocked) event.preventDefault();
    });
    instance.controls.addEventListener('lock', () => {
      instance.css3dContainer.style.pointerEvents = 'none';
      instance.chatInput.blur();
      instance.chatActive = false;
      instance.chatInput.disabled = true;
      document.getElementById('chat-container').style.opacity = '0';
      if (instance.player.firstPersonArms) {
        instance.player.firstPersonArms.group.visible = true;
      }
    });
    instance.controls.addEventListener('unlock', () => {
      instance.css3dContainer.style.pointerEvents = 'auto';
    });
  };

  instance.onKeyDown = function(event) {
    if (instance.chatActive) return;
    switch (event.code) {
      case 'KeyW': instance.moveForward = true; break;
      case 'KeyS': instance.moveBackward = true; break;
      case 'KeyA': instance.moveLeft = true; break;
      case 'KeyD': instance.moveRight = true; break;
      case 'KeyQ': instance.isHoldingQ = true; break;
      case 'Space':
        if (instance.player.onGround) {
          instance.jump = true;
          instance.player.velocity.y = 10;
          instance.player.onGround = false;
        }
        break;
      case 'ShiftLeft': instance.sprint = true; break;
      case 'KeyC': instance.crouch = true; break;
    }
  };

  instance.onKeyUp = function(event) {
    switch (event.code) {
      case 'KeyW': instance.moveForward = false; break;
      case 'KeyS': instance.moveBackward = false; break;
      case 'KeyA': instance.moveLeft = false; break;
      case 'KeyD': instance.moveRight = false; break;
      case 'KeyQ': instance.isHoldingQ = false; break;
      case 'ShiftLeft': instance.sprint = false; break;
      case 'KeyC': instance.crouch = false; break;
    }
  };

  instance.onMouseDown = function(event) {
    if (event.target.closest('.slot-machine-ui')) {
      instance.css3dContainer.style.pointerEvents = 'auto';
      return;
    }
    if (event.button === 0 && instance.controls.isLocked && !instance.chatActive) {
      instance.handleUiRaycastClick();
    }
    if (instance.controls.isLocked && !instance.chatActive) {
      if (event.button === 0) {
        instance.leftArmRaised = true;
        instance.room.updatePresence({ leftArmRaised: true });
      } else if (event.button === 2) {
        instance.rightArmRaised = true;
        instance.room.updatePresence({ rightArmRaised: true });
      }
    }
  };

  instance.onMouseUp = function(event) {
    if (event.button === 0) {
      if (instance.leftArmRaised) {
        instance.leftArmRaised = false;
        instance.room.updatePresence({ leftArmRaised: false });
      }
    } else if (event.button === 2) {
      if (instance.rightArmRaised) {
        instance.rightArmRaised = false;
        instance.room.updatePresence({ rightArmRaised: false });
      }
    }
    setTimeout(() => {
      if (instance.controls.isLocked && !document.querySelector('.slot-machine-ui:hover')) {
        instance.css3dContainer.style.pointerEvents = 'none';
      }
    }, 50);
  };

  instance.onMouseWheel = function(event) {
    if (instance.controls.isLocked && !instance.chatActive) {
      const delta = Math.sign(event.deltaY) * -0.5;
      if (instance.isHoldingQ) {
        instance.player.targetChompAmount = Math.min(Math.max(instance.player.targetChompAmount + delta * 0.2, 0), 1);
        instance.room.updatePresence({ chompAmount: instance.player.targetChompAmount });
      } else if (instance.crouch) {
        instance.player.targetLegStretch = Math.min(Math.max(instance.player.targetLegStretch + delta, 1), 3);
        instance.room.updatePresence({ legStretch: instance.player.targetLegStretch });
      } else {
        instance.player.targetArmStretch = Math.min(Math.max(instance.player.targetArmStretch + delta, 0), 5);
        instance.room.updatePresence({ armStretch: instance.player.targetArmStretch });
      }
    }
  };

  instance.handleUiRaycastClick = function() {
    if (!instance.controls.isLocked) return;
    instance.uiRaycaster.setFromCamera(instance.mousePosition, instance.camera);
    let closestObject = null;
    let closestDistance = Infinity;
    let objectType = null;
    for (const machineId in instance.slotMachines) {
      const machine = instance.slotMachines[machineId];
      if (!machine?.model) continue;
      const intersects = instance.uiRaycaster.intersectObject(machine.model, true);
      if (intersects.length && intersects[0].distance < 5 && intersects[0].distance < closestDistance) {
        closestDistance = intersects[0].distance;
        closestObject = machine;
        objectType = 'slot';
      }
    }
    for (const gameId in instance.minesGames) {
      const game = instance.minesGames[gameId];
      if (!game?.model) continue;
      const intersects = instance.uiRaycaster.intersectObject(game.model, true);
      if (intersects.length && intersects[0].distance < 5 && intersects[0].distance < closestDistance) {
        closestDistance = intersects[0].distance;
        closestObject = game;
        objectType = 'mines';
      }
    }
    if (closestObject) {
      const uiElement = closestObject.uiElement;
      if (uiElement && uiElement.style.opacity !== '0') {
        const intersects = instance.uiRaycaster.intersectObject(closestObject.model, true);
        if (intersects.length) {
          const hitPoint = intersects[0].point;
          const screenPos = instance.worldToScreen(hitPoint);
          const elementsAtPoint = document.elementsFromPoint(screenPos.x, screenPos.y);
          for (const element of elementsAtPoint) {
            let clickedElement = null;
            let feedbackColor = '';
            if (objectType === 'slot') {
              if (element.closest('.slot-machine-ui') && (element.classList.contains('slot-button') || element.classList.contains('bet-button'))) {
                clickedElement = element;
                feedbackColor = '#aa0000';
              }
            } else {
              if (element.closest('.mines-game-ui-v2') && (element.classList.contains('mines-v2-button') || element.classList.contains('mines-v2-tile'))) {
                clickedElement = element;
                feedbackColor = '#0044aa';
              }
            }
            if (clickedElement && !clickedElement.disabled && !clickedElement.classList.contains('disabled')) {
              clickedElement.click();
              const originalBgColor = clickedElement.style.backgroundColor;
              clickedElement.style.backgroundColor = feedbackColor;
              setTimeout(() => clickedElement.style.backgroundColor = originalBgColor, 100);
            }
            if (clickedElement) break;
          }
        }
      }
      return;
    }
  };

  instance.simulateClickAtPosition = function(screenPos, containerElement) {
    const elementsAtPoint = document.elementsFromPoint(screenPos.x, screenPos.y);
    for (const element of elementsAtPoint) {
      if (element.closest('.slot-machine-ui') && (element.classList.contains('slot-button') || element.classList.contains('bet-button'))) {
        element.click();
        const originalBgColor = element.style.backgroundColor;
        element.style.backgroundColor = '#aa0000';
        setTimeout(() => element.style.backgroundColor = originalBgColor, 100);
        break;
      }
    }
  };

  instance.worldToScreen = function(worldPosition) {
    const vector = worldPosition.clone();
    vector.project(instance.camera);
    return {
      x: (vector.x * 0.5 + 0.5) * window.innerWidth,
      y: (-(vector.y * 0.5) + 0.5) * window.innerHeight
    };
  };
}
