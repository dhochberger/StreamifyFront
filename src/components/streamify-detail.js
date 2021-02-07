import React, { useState, useEffect } from 'react';
import './components.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify, faTwitch, faTwitterSquare } from '@fortawesome/free-brands-svg-icons';
import { faSync, faLaptopHouse, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

//import { useCookies } from 'react-cookie';

import { SPOTAPI } from '../spotify-api-service';

import SpotifyWebApi from 'spotify-web-api-js';

//import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
//import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';

import swal from 'sweetalert';
import ProgressBar from './progressbar.js';

function UserDatasDetails(props) {

  const spotifyWebApi = new SpotifyWebApi();

  let userDatas = props.userdatas;

  let player = '';
  let oldTrack = '';
  let oldArtist = '';
  let temp_is_playing = true;
  let interv = 0;

  //const [token] = useCookies(['streamify-token']);

  const [ myselfDatas, setMyself ] = useState()

  const [ spotifyClicked, isSpotifyClicked ] = useState(false);
  const [ twitchClicked, isTwitchClicked ] = useState(false);
  const [ twitterClicked, isTwitterClicked ] = useState(false);

  const [ refreshPlayer, refreshingPlayer ] = useState(false);
  const [ productMe , setProductMe ] = useState('');

  const [ showDevices, setShowDevices ] = useState(false);
  const [ showVolume, setShowVolume ] = useState(false);

  const [ userDeviceId, setDevices ] = useState([]);
  const [ currentDevice, setCurrentDevice ] = useState('')
  const [ volume, setVolume ] = useState(0);

  const [ progressMin__bar, setProgressMin ] = useState()
  const [ progressSec__bar, setProgressSec ] = useState()
  const [ durationMin__bar, setDurationMin ] = useState()
  const [ durationSec__bar, setDurationSec ] = useState()
  const [ progressionTrack, setProgressionTrack ] = useState()

  const [ currentArtist, setCurrentArtist ] = useState([]);
  const [ currentSong, setCurrentSong ] = useState('');
  const [ currentImage, setCurrentImage ] = useState('');

  const checkForPlayer = () => {
    if (props.myselfDatas.user !== "" && window.Spotify !== null && player === '') {
      player = new window.Spotify.Player({
        name: "Streamify's Spotify Player",
        getOAuthToken: cb => { cb(props.myselfDatas.access_token); },
      });
      //  createEventHandlers();

      // finally, connect!
      player.connect();
    }
  }

  useEffect( () => {

      refreshingPlayer(false)

      if (props.myselfDatas.access_token !== "" && props.myselfDatas.access_token !== undefined){
        gettingDevices(props.myselfDatas.access_token)
        setMyself(props.myselfDatas)
      }
  }, [props.userdatas, props.myselfDatas])

  useEffect( () => {
    if (props.myselfDatas.access_token === "" || props.myselfDatas.access_token === undefined){
      swal({
        title: "ATTENTION : Connexion à Spotify manquante",
        text: "Vous n'avez pas encore lié votre compte Spotify, allez sur la page Profil, puis Connexion, et connectez votre compte selon votre besoin (Partage ou écoute). N'hésitez pas non plus à aller dans l'onglet Général afin de modifier votre pseudonyme d'affichage et le partage de votre écoute.",
        icon: "warning",
        dangerMode: true,
      })
    }
  }, [])

  useEffect( () => {
    if (productMe==='open'){
      swal({
        title: "RAPPEL : Compte gratuit",
        text: "Vous êtes connectés avec un compte Spotify gratuit, vous ne pourrez donc pas profiter des fonctionnalités du site.",
        icon: "warning",
        dangerMode: true,
      })
      setProductMe("checked")
    }
  }, [productMe])

  useEffect(  () => {
    function handleClick() {
      if(showDevices)
        setShowDevices(false)
      if(showVolume)
        setShowVolume(false)
    }
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  });

  const setCurrent =  async (stateTrack) => {
    if (typeof(stateTrack) === "undefined")
      stateTrack = await spotifyWebApi.getMyCurrentPlayingTrack()

      const me = await SPOTAPI.getDevices(props.myselfDatas.access_token)

    if (stateTrack && (stateTrack !== null && stateTrack.item !== null) ){
      if (currentArtist !== stateTrack.item.artists) setCurrentArtist(stateTrack.item.artists);
      if(stateTrack.item.album.images.length>0) {
        setCurrentImage(stateTrack.item.album.images[0].url);
      }

      if (currentSong !== stateTrack.item.name) {

        gettingDevices(myselfDatas.access_token)
        await setCurrentSong(stateTrack.item.name);


        const tempArray = []
        tempArray.push(stateTrack.item.uri)

        var tempDur = stateTrack.item.duration_ms/60000
        tempDur = tempDur.toString(10).split('.')
        setDurationMin(tempDur[0])

        tempDur = stateTrack.item.duration_ms%60000/1000
        tempDur = tempDur.toString(10).split('.')
        setDurationSec(tempDur[0])

        // playSong(deviceId, uri, position_ms, access_token)
        if (stateTrack.is_playing === true && stateTrack.item.is_local !== true && currentSong !== stateTrack.item.name)
          if (currentDevice === '' && me.devices.length >= 1)
            await SPOTAPI.playSong(me.devices[0].id, tempArray, stateTrack.progress_ms, myselfDatas.access_token)
          else await SPOTAPI.playSong(currentDevice, tempArray, stateTrack.progress_ms, myselfDatas.access_token)
      }
    }
    else {
      setCurrentArtist([])
      setCurrentImage('')
      setVolume(0)
      setCurrentSong('')
    }
  }

  const gettingDevices = async (access_token) => {

    if (access_token !== "" && access_token !== undefined ){
      if (props.myselfDatas) {
        if (player === '') checkForPlayer()
        if (productMe === ''){
          const temp_me = await SPOTAPI.getMe(props.myselfDatas.access_token)
          setProductMe(temp_me.product)
        }

        const temp = await SPOTAPI.getDevices(props.myselfDatas.access_token)

        setDevices(temp.devices)

        for(var i=0;i<temp.devices.length;i++){

          if(!currentDevice && temp.devices[i].is_active === true){
            await SPOTAPI.transferPlayback(temp.devices[i].id, props.myselfDatas.access_token);
            setCurrentDevice(temp.devices[i].id)
            break;
          }

          if(!currentDevice && i===temp.devices.length){
            await SPOTAPI.transferPlayback(temp.devices[0].id, props.myselfDatas.access_token);
            setCurrentDevice(temp.devices[0].id)
          }
        }

      }

    }

  }

  const isClicked = button => async evt => {

    if (button === 'spotify') isSpotifyClicked(!spotifyClicked)
    else if (button === 'twitch') isTwitchClicked(!twitchClicked)
    else if (button === 'twitter') isTwitterClicked(!twitterClicked)

    else if (props.myselfDatas.access_token !== undefined && props.myselfDatas.access_token !== "" && props.myselfDatas.user !== "" && button === 'refresh' ){

      await SPOTAPI.getDevices(props.myselfDatas.access_token)

      await gettingDevices(props.myselfDatas.access_token)
      spotifyWebApi.setAccessToken(props.userdatas.access_token)

      const stateTrack = await spotifyWebApi.getMyCurrentPlayingTrack()
      const state = await spotifyWebApi.getMyCurrentPlaybackState()

      if (stateTrack) {
        setVolume(state.device.volume_percent)
      }
      if (stateTrack && stateTrack.item !== null) {
        refreshingPlayer(true);
        oldTrack = stateTrack.item.name
        oldArtist = stateTrack.item.artists
        setCurrent(stateTrack)
        checkPlaySong()
      }
      else {
        refreshingPlayer(false)
        setCurrent(null)
      }
    }

  }

  const showMenu = async () => {
    setShowDevices(!showDevices)
  }

  const showVolumeSlider = () => {
    setShowVolume(!showVolume)
  }

  const setDevice = async id => {

    setShowDevices(false)
    await SPOTAPI.transferPlayback(id, myselfDatas.access_token);
    const stateTrack = await spotifyWebApi.getMyCurrentPlayingTrack()

    if(stateTrack!==undefined){
      setCurrentDevice(id)
    }

  }

  const handleVolumeChange = async (event, newValue) => {
    setVolume(newValue);
    await SPOTAPI.volumePlayback(currentDevice, newValue, myselfDatas.access_token)
    return newValue
  }


  const checkPlaySong = async () => {

    let stateTrack = await spotifyWebApi.getMyCurrentPlayingTrack();

    if (stateTrack !== undefined && stateTrack.item !== null && stateTrack.item !== undefined){

      let timeout=stateTrack.item.duration_ms+1000-stateTrack.progress_ms;

//------------------------------------------------------------------------------
      setTimeout( stateTrack => {
        if (stateTrack !== undefined){
          setCurrent(stateTrack)
          oldTrack = stateTrack.item.name
          oldArtist = stateTrack.item.artists
          checkPlaySong();
        }
      }, (timeout) )
//------------------------------------------------------------------------------

        //------------------------------TimeoutProgress-------------------------
      window.interv = setTimeout( async function repeat() {
        clearTimeout(window.interv)

        const temp_stateTrack = await spotifyWebApi.getMyCurrentPlayingTrack();

        if (temp_stateTrack.currently_playing_type==='ad'){
          setTimeout( () => {
            checkPlaySong()
          }, 30000);
        }

        else if (temp_stateTrack !== undefined && temp_stateTrack.item !== undefined && temp_stateTrack.item !== null){

          if (temp_stateTrack.item.name !== oldTrack && temp_stateTrack.item.artists !== oldArtist){
            oldTrack = temp_stateTrack.item.name
            oldArtist = temp_stateTrack.item.artists
            setCurrent(temp_stateTrack)
          }

          if (!temp_stateTrack.is_playing && temp_is_playing){
            temp_is_playing = false;
            userDatas.spotify_api.is_playing = false
            await SPOTAPI.pause(myselfDatas.access_token)
            clearTimeout(interv)
          }
          else if (temp_stateTrack.is_playing && !temp_is_playing){
            temp_is_playing = true;
            userDatas.spotify_api.is_playing = true;
            await SPOTAPI.play(myselfDatas.access_token)
            clearTimeout(interv)
          }

          let tempDur = temp_stateTrack.progress_ms/60000
          tempDur = tempDur.toString(10).split('.')
          setProgressMin(tempDur[0])

          tempDur = temp_stateTrack.progress_ms%60000/1000
          tempDur = tempDur.toString(10).split('.')
          setProgressSec(tempDur[0])

          setProgressionTrack(temp_stateTrack.progress_ms*100/temp_stateTrack.item.duration_ms)

        }
        else {
          checkPlaySong()
        }

        setTimeout(repeat, 1000)


      }, 1000)
      //------------------------------TimeoutProgress---------------------------------
      }

    else if (stateTrack.currently_playing_type === 'ad') setTimeout( () => {
                                                                    checkPlaySong()
                                                                  },(30000) )
    else if (stateTrack.currently_playing_type !== 'track') { temp_is_playing = false;
                                                              setTimeout( () => {
                                                                    checkPlaySong()
                                                                  }, 300000)
                                                                }
    else {
          checkPlaySong()
        }

  }




  return (
    <React.Fragment>

    { userDatas ? (

        <React.Fragment>
          <div className="userlist-details">
            <h1>{userDatas && userDatas.user.get_username}</h1>
            <div className="connections">
              <a href={spotifyClicked ? "https://www.google.fr" : null}><FontAwesomeIcon id="connections" type="spotify" icon={faSpotify} className={userDatas.spotify_api.is_playing ? 'green' : 'grey'}/></a>
              <a href={twitchClicked ? "https://www.google.fr" : null}><FontAwesomeIcon id="connections" type="twitch" icon={faTwitch} className={twitchClicked ? 'purple' : 'grey'}/></a>
              <a href={twitterClicked ? "https://www.google.fr": null}><FontAwesomeIcon id="connections" type="twitter" icon={faTwitterSquare} className={twitterClicked ? 'blue' : 'grey'} /></a>
            </div>

      { player !== undefined || refreshPlayer ?

                              (
                                <React.Fragment>

                                  <div className="spotify-player-container">
                                  {refreshPlayer ?

                                    <React.Fragment>

                                      <div className="spotify-player">

                                        <div className="devices">
                                          <FontAwesomeIcon id="connections" onClick={e => showMenu()} icon={faLaptopHouse} className='player' />
                                          <div className="dropdownDevices">
                                            { showDevices ? userDeviceId.map( (device, index) => {
                                                            return( <button className="button-devices" onMouseDown={e => setDevice(e.target.id)} id={device.id} key={index}>{device.name}</button>)
                                                          })
                                                          : null
                                            }
                                          </div>
                                        </div>
                                        <div className="devices">
                                          <FontAwesomeIcon id="connections" onClick={e => showVolumeSlider()} icon={faVolumeUp} className='player' />
                                          <div className="dropdownDevices volumeSlider">
                                            { showVolume ? <React.Fragment>
                                                              <Grid container spacing={2}>
                                                                <Grid item>
                                                                  <VolumeDown />
                                                                </Grid>
                                                                <Grid item xs>
                                                                  <Slider value={volume} onChange={handleVolumeChange} aria-labelledby="continuous-slider" />
                                                                </Grid>
                                                                <Grid item>
                                                                  <VolumeUp />
                                                                </Grid>
                                                              </Grid>
                                                           </React.Fragment>
                                                        : null
                                                      }
                                          </div>
                                        </div>
                                      </div>

                                      <div className="progressionBar">
                                        <div className="progress">
                                          <span className="progress">{progressMin__bar}:{progressSec__bar && progressSec__bar.length===1 ? '0' + progressSec__bar : progressSec__bar}</span>
                                        </div>
                                          <ProgressBar bgcolor={'#A4EA96'} completed={progressionTrack} />
                                          <span className="duration">{durationMin__bar}:{durationSec__bar && durationSec__bar.length ===1 ? '0' + durationSec__bar : durationSec__bar}</span>
                                      </div>

                                      <div className="playback">
                                        <img className="playbackimg" src={currentImage} alt="album pic"/>
                                        <div className="song">
                                          <div className="artist">
                                            { currentArtist ? currentArtist.map((artist, index) => {
                                                if(index !== currentArtist.length-1)
                                                  return (artist.name + ', ')
                                                else return (artist.name)
                                              })
                                              : null
                                            }
                                          </div>
                                          <div className="songName">
                                            {currentSong}
                                          </div>
                                        </div>
                                      </div>
                                    </React.Fragment>

                                    : <div className="refresh">
                                        <FontAwesomeIcon id="connections" onClick={isClicked('refresh')} icon={faSync} className='player' />
                                        <span className="refresh"> Rafraîchir le lecteur</span>
                                      </div>
                                  }
                                  </div>

                                </React.Fragment>
                              )
                              : <FontAwesomeIcon id="connections" icon={faSync} className='player' /> }

      {spotifyClicked ? <div>
                          <span className="green">Clicked</span>
                        </div>
                      : null }

      {twitchClicked ? <div>
                          <span className="purple">Clicked</span>
                        </div>
                      : null }


          </div>
        </React.Fragment>
      ) : null }

    </React.Fragment>
  )
}

export default UserDatasDetails;
