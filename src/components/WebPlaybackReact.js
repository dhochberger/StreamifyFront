import React, { Component, Fragment } from 'react';

export default class WebPlayback extends Component {
  deviceSelectedInterval = null
  statePollingInterval = null
  webPlaybackInstance = null

  state = {
    playerReady: false,
    playerSelected: false
  }

  async handleState(state) {
    let {
      onPlayerStateChange,
      onPlayerWaitingForDevice,
      onPlayerDeviceSelected,
    } = this.props;

    if (state) {
      onPlayerStateChange(state);
    } else {
      let {
        _options: { id: device_id }
      } = this.webPlaybackInstance;

      this.clearStatePolling();
      onPlayerWaitingForDevice({ device_id });
      await this.waitForDeviceToBeSelected();
      onPlayerDeviceSelected();
    }
  }

  waitForSpotify() {
    return new Promise(resolve => {
      if ('Spotify' in window) {
        resolve();
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => { resolve(); };
      }
    });
  }

  waitForDeviceToBeSelected() {
    return new Promise(resolve => {
      this.deviceSelectedInterval = setInterval(() => {
        if (this.webPlaybackInstance) {
          this.webPlaybackInstance.getCurrentState().then(state => {
            if (state !== null) {
              this.startStatePolling();
              clearInterval(this.deviceSelectedInterval);
              resolve(state);
            }
          });
        }
      });
    });
  }

  startStatePolling() {
    this.statePollingInterval = setInterval(async () => {
      let state = await this.webPlaybackInstance.getCurrentState();
      await this.handleState(state);
    }, this.props.playerRefreshRateMs || 1000);
  }

  clearStatePolling() {
    clearInterval(this.statePollingInterval);
  }

  async setupWebPlaybackEvents() {
    let { Player } = window.Spotify;
    let {
      playerName,
      playerInitialVolume,
      onPlayerRequestAccessToken,
    } = this.props;

    this.webPlaybackInstance = new Player({
      name: playerName,
      volume: playerInitialVolume,
      getOAuthToken: async callback => {
        if (typeof onPlayerRequestAccessToken !== "undefined") {
          let userAccessToken = await onPlayerRequestAccessToken();
          callback(userAccessToken);
        }
      }
    });

    this.webPlaybackInstance.on("initialization_error", ({ message }) => {
      this.props.onPlayerError(message);
    });

    this.webPlaybackInstance.on("authentication_error", ({ message }) => {
      this.props.onPlayerError(message);
    });

    this.webPlaybackInstance.on("account_error", ({ message }) => {
      this.props.onPlayerError(message);
    });

    this.webPlaybackInstance.on("playback_error", ({ message }) => {
      this.props.onPlayerError(message);
    });

    this.webPlaybackInstance.on("player_state_changed", async state => {
      await this.handleState(state);
    });

    this.webPlaybackInstance.on("ready", data => {
      this.props.onPlayerWaitingForDevice(data);
    });

    if (this.props.playerAutoConnect) {
      this.webPlaybackInstance.connect();
    }
  }

  setupWaitingForDevice() {
    return new Promise(resolve => {
      this.webPlaybackInstance.on("ready", data => {
        resolve(data);
      });
    });
  }

  async componentWillMount() {
    let {
      onPlayerLoading,
      onPlayerWaitingForDevice,
      onPlayerDeviceSelected
    } = this.props;

    // Notify the player is loading
    onPlayerLoading();

    // Wait for Spotify to load player
    await this.waitForSpotify();

    // Setup the instance and the callbacks
    await this.setupWebPlaybackEvents();

    // Wait for device to be ready
    let device_data = await this.setupWaitingForDevice();
    onPlayerWaitingForDevice(device_data);

    // Wait for device to be selected
    await this.waitForDeviceToBeSelected();
    onPlayerDeviceSelected();
  }

  render() {
    return (<Fragment>{this.props.children}</Fragment>);
  }
};
