import WebsimSocket from '../../utils/WebsimSocket.js';

/**
 * Mixin for multiplayer/socket logic
 * Attaches initialization and message handlers to the SocialSpace instance.
 */
export default function applyMultiplayer(instance) {
  // Stub missing multiplayer helpers until full migration
  instance.updatePlayers = instance.updatePlayers || function() {};
  instance.updatePlayerList = instance.updatePlayerList || function() {};
  instance.createFirstPersonArms = instance.createFirstPersonArms || function() {};

  // Stub core instance props to avoid undefined errors
  instance.player = instance.player || {};
  instance.currencyDisplay = instance.currencyDisplay || { textContent: '' };
  
  // Initialize room if not already set
  if (!instance.room) {
    instance.room = new WebsimSocket();
  }

  instance.initializeMultiplayer = async function() {
    await this.room.initialize();
    // Safeguard player state defaults
    const playerState = this.player || {};
    const {
      armStretch = 0,
      legStretch = 0,
      chompAmount = 0,
      money = 0
    } = playerState;

    // Initial presence setup
    this.room.updatePresence({
      position: { x: 0, y: 1.8, z: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      leftArmRaised: false,
      rightArmRaised: false,
      armStretch,
      legStretch,
      chompAmount,
      money
    });

    // Subscribe to presence updates (for player movement, money changes, etc.)
    this.room.subscribePresence(presence => {
      const clientPresence = presence?.[this.room.clientId];
      if (clientPresence?.money !== undefined) {
        this.player.money = clientPresence.money;
        const currentDisplayValue = parseInt(this.currencyDisplay.textContent.replace(/[^0-9]/g, '')) || 0;
        if (currentDisplayValue !== this.player.money) {
          this.currencyDisplay.textContent = `$${this.player.money.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
        }
      }
      this.updatePlayers(presence);
      this.updatePlayerList();
    });

    // Subscribe to room state updates (for game states like slots, mines)
    this.room.subscribeRoomState(roomState => {
      if (roomState.slotMachines) this.updateSlotMachinesFromRoomState(roomState.slotMachines);
      if (roomState.minesGames) this.updateMinesGamesFromRoomState(roomState.minesGames);
    });

    // Subscribe to presence update requests (for receiving money)
    this.room.subscribePresenceUpdateRequests((updateRequest, fromClientId) => {
      // Safely get own presence data
      const clientPresence = this.room.presence?.[this.room.clientId] || {};
      const senderUsername = this.room.peers[fromClientId]?.username || 'Someone';
      if (updateRequest.type === 'giveMoney') {
        const amount = parseFloat(updateRequest.amount) || 0;
        if (amount > 0) {
          const currentMoney = parseFloat(clientPresence.money) || 0;
          const newMoney = currentMoney + amount;
          this.room.updatePresence({ money: newMoney });
          this.addChatMessage(`${senderUsername} gave you $${amount.toLocaleString('en-US', {maximumFractionDigits: 0})}!`, 'system');
        }
      }
    });

    // Handle incoming messages/events
    this.room.onmessage = event => {
      const data = event.data;
      switch (data.type) {
        case 'connected':
          console.log(`Player connected: ${data.username}`);
          this.addChatMessage(`${data.username} entered the casino`, 'system');
          this.updatePlayerList();
          break;
        case 'disconnected':
          const username = this.room.peers[data.clientId]?.username || this.players[data.clientId]?.username || 'Someone';
          if (username !== 'Someone') this.addChatMessage(`${username} left the casino`, 'system');
          break;
        case 'chat':
          this.addChatMessage(data.message, data.username);
          break;
        case 'moneySent':
          if (data.senderId === this.room.clientId) this.addChatMessage(`You gave $${data.amount.toLocaleString('en-US', {maximumFractionDigits: 0})} to ${data.recipientUsername}.`, 'system');
          break;
        case 'moneySendError':
          if (data.senderId === this.room.clientId) this.addChatMessage(`Error: ${data.message}`, 'system-error');
          break;
        case 'minesGameStart':
          if (data.clientId !== this.room.clientId) this.addChatMessage(`${data.username} started a mines game with $${data.betAmount} bet (${data.mineCount} mines)`, 'system');
          break;
        case 'minesCashout':
          if (data.clientId !== this.room.clientId) {
            let message = `${data.username} cashed out $${data.payout} after revealing ${data.revealed} tiles!`;
            if (data.isPerfectGame) message = `🏆 PERFECT GAME! ${data.username} revealed all safe tiles and won $${data.payout}!`;
            this.addChatMessage(message, 'system');
          }
          break;
        case 'minesBust':
          if (data.clientId !== this.room.clientId) this.addChatMessage(`${data.username} hit a mine and lost $${data.betAmount} after revealing ${data.revealedCount} tiles`, 'system');
          break;
      }
    };

    this.updatePlayerList();
    this.createFirstPersonArms();
    // Safely update currency display using default money
    if (this.currencyDisplay) {
      this.currencyDisplay.textContent = `$${money}`;
    }
  };
}
