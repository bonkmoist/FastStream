import {PlayerModes} from '../enums/PlayerModes.mjs';

export class PlayerLoader {
  constructor() {
    this.players = {};

    this.registerPlayer(PlayerModes.DIRECT, './DirectVideoPlayer.mjs');
    this.registerPlayer(PlayerModes.ACCELERATED_MP4, './mp4/MP4Player.mjs');
    this.registerPlayer(PlayerModes.ACCELERATED_HLS, './hls/HLSPlayer.mjs');
    this.registerPlayer(PlayerModes.ACCELERATED_DASH, './dash/DashPlayer.mjs');
    this.registerPlayer(PlayerModes.ACCELERATED_YT, './yt/YTPlayer.mjs');
  }

  createPlayer(mode, client, options) {
    if (!Object.hasOwn(this.players, mode)) {
      throw new Error(`Unknown player mode: ${mode}`);
    }

    const playerHolder = this.players[mode];
    if (playerHolder.Player) {
      return new playerHolder.Player(client, options);
    }

    return new Promise(async (resolve, reject) => {
      playerHolder.waiting.push(() => {
        resolve(new playerHolder.Player(client, options));
      });

      if (!playerHolder.loadingStarted) {
        playerHolder.loadingStarted = true;
        playerHolder.Player = (await import(playerHolder.url)).default;
        playerHolder.waiting.forEach((execute) => {
          execute();
        });
        playerHolder.waiting = [];
      }
    });
  }

  registerPlayer(mode, playerURL) {
    this.players[mode] = {
      url: playerURL,
      loadingStarted: false,
      Player: null,
      waiting: [],
    };
  }
}
