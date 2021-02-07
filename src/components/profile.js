import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import '../App.css';
import './profile.css'

import { API } from '../api-service'
import { SPOTAPI } from '../spotify-api-service'

import { useCookies } from 'react-cookie';
import { useFetch } from '../hooks/useFetch';

import queryString from 'query-string';
import swal from 'sweetalert';

import * as CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes'

function Profile(props){


  const [ showGeneral, setShowGeneral ] = useState(false)
  const [ showPassword, setShowPassword ] = useState(false)
  const [ showEmail, setShowEmail ] = useState(false)
  const [ showRooms, setShowRooms ] = useState(false)
  const [ showConnexion, setShowConnexion ] = useState(false)
  const [ product, setProduct ] = useState('')

  const [ username, setUsername ] = useState('');
  const [ wrongUser, setWrongUser ] = useState(false);

  const [ password, setPassword ] = useState('');
  const [ newpassword, setNewpassword ] = useState('');
  const [ wrongPw, setWrongPw ] = useState(false);

  const [ email, setEmail ] = useState('');

  const [ refreshStreaming, setRefreshStreaming ] = useState('');
  const [ refreshListening, setRefreshListening ] = useState('');
  const [ streamingIsokay, setStrOkay ] = useState(false);
  const [ listenIsokay, setListOkay ] = useState(false);
  const [ refreshOkay, setRefreshOkay ] = useState(false);

  const [ user_type, setType ] = useState('VIEW');
  const [ showing_username, setShowingName ] = useState('');
  const [ sharing, setSharing ] = useState(false);

  const [ token, setToken, deleteToken ] = useCookies(['streamify-token'])
  const [ user, userDatas, myself, loading, error ] = useFetch();

  const [ showing_topname, setShowingTopname ] = useState('');

  const [ savedStatus, setSavedStatus ] = useState(false);

  useEffect( () => {
    if(!token['streamify-token'] || token['streamify-token'] === 'undefined') {window.location.href='/'; deleteToken('streamify-token');
      };
  }, [token] )

  const isClicked = button => evt => {
    setShowGeneral(false)
    setShowPassword(false)
    setShowEmail(false)
    setShowRooms(false)
    setShowConnexion(false)

    if (button === "general"){
      setShowGeneral(true)
    }
    else if (button === "password"){
      setShowPassword(true)
    }
    else if (button === "email"){
      setShowEmail(true)
    }
    else if (button === "rooms"){
      setShowRooms(true)
    }
    else if (button === "connexion"){
      setShowConnexion(true)
    }
  }

  const logoutUser = () => {
    deleteToken('streamify-token');
    window.location.href="/"
  }

  var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const redirectStreaming = 'https://accounts.spotify.com/authorize?client_id='+process.env.REACT_APP_CLIENT_ID+'&response_type=code&redirect_uri='+process.env.REACT_APP_REDIRECT_PROFILE_URI+'&scope=user-read-playback-state&state=streamingtoken';
  const redirectListening = 'https://accounts.spotify.com/authorize?client_id='+process.env.REACT_APP_CLIENT_ID+'&response_type=code&redirect_uri='+process.env.REACT_APP_REDIRECT_PROFILE_URI+'&scope=streaming user-read-private user-read-playback-state user-modify-playback-state&state=listeningtoken';

  const registerRefreshStreaming = async (code) => {
    const resp = await SPOTAPI.getRefreshToken(code)
    var temp_refresh_token = CryptoAES.encrypt(resp.refresh_token, process.env.REACT_APP_ENCRYPTKEY).toString();
    await API.setRefreshToken( token['streamify-token'], {'refresh_token_streaming':temp_refresh_token}, myself.user.user)
          .then(resp => console.log(resp))
          .catch(error => console.log(error))
  }


  const registerRefreshListening = async (code) => {
    const resp = await SPOTAPI.getRefreshToken(code)
    var temp_refresh_token = CryptoAES.encrypt(resp.refresh_token, process.env.REACT_APP_ENCRYPTKEY).toString();
    await API.setRefreshToken( token['streamify-token'], {'refresh_token_listening':temp_refresh_token}, myself.user.user)
          .then(resp => console.log(resp))
          .catch(error => console.log(error))
  }

  const createuser = async () => {
    await API.registerUserdatas(token['streamify-token'], {'user':myself.user.user,'showing_username':myself.user.username})
  }

  const updateUser = async () => {
    const user_dict = {}
    if (showing_username !== myself.user.get_username) user_dict['showing_username'] = showing_username;
    if (sharing !== myself.user.sharing) user_dict['sharing'] = sharing;
    if (user_type !== myself.user.get_type) user_dict['user_type'] = user_type;

    const resp = await API.modifyUserdatas(user_dict, myself.user.user, token['streamify-token'])
    if (resp.status === 200) setSavedStatus(true)
  }

  useEffect( () => {
    if (myself.access_token === "")
      createuser();
    else if (myself.user !== undefined){
      setShowingName(myself.user.get_username)
      setType(myself.user.get_type)
      setSharing(myself.user.sharing)
      //setShowingName(myself.user)
    }
  }, [myself])


  const getProduct = async () => {
    const temp_me = await SPOTAPI.getMe(myself.access_token)
    setProduct(temp_me.product)
  }

  useEffect(() => {
    if (myself.user !== "" && myself.user !== undefined){
      setShowingTopname(myself.user.get_username);
      if( myself.user.get_refresh_token_streaming !== undefined && myself.user.get_refresh_token_streaming !== '') setStrOkay(true)
      if( myself.user.get_refresh_token_listening !== undefined && myself.user.get_refresh_token_listening !== '') setListOkay(true)
      let url = window.location.search;
      let params = queryString.parse(url);
      if (params.code !== undefined){
        setRefreshOkay(true)
        if (params.state === 'streamingtoken'){
          //setRefreshStreaming(params.code);
          registerRefreshStreaming(params.code)
        }
        else if (params.state === 'listeningtoken'){
          //setRefreshListening(params.code);
          registerRefreshListening(params.code)
        }
        else setRefreshOkay(false)
      }
    }
  }, [myself])

  useEffect( () => {
    if (myself )
    if (product==='open'){
      swal({
        title: "ATTENTION : Compte gratuit",
        text: "Vous êtes connectés avec un compte Spotify gratuit, vous ne pourrez donc pas profiter des fonctionnalités du site.",
        icon: "warning",
        dangerMode: true,
      })
      setProduct("checked")
    }
  }, [product])

  return(
    <div className="App">
      <React.Fragment>

        <div className="navbar">
          <span onClick={() => window.location.href='/streamify'} className="profile-link">Streamify</span>
          <span onClick={() => window.location.href='/profile'} className="profile-link">Profil</span>
          <FontAwesomeIcon icon={faSignOutAlt} onClick={logoutUser}/>
        </div>


        <header className="App-header">
          <h1>
            <FontAwesomeIcon onClick={() => window.location.href='/streamify'} icon={faSpotify} className="app-title"/>
            <span onClick={() => window.location.href='/streamify'} className="app-title"> Streamify </span>
          </h1>
        </header>

        <div className="App-header">
          <h1>
            <span className="h1username"> &gt; {showing_topname} &lt;</span>
          </h1>
        </div>

        <div className="layout">

          <div className="choice-to-change">
            <h2 onClick={isClicked('general')}>Général</h2>
            <h2 onClick={isClicked('password')}>Mot de passe</h2>
            <h2 onClick={isClicked('email')}>Adresse email</h2>
            <h2 onClick={isClicked('rooms')}>Salons suivis</h2>
            <h2 onClick={isClicked('connexion')}>Connexions</h2>
          </div>

          <div className="selected-choice">

            <div className="general-change hidden" style={{display: showGeneral ? 'block' : 'none' }} >

                <label htmlFor="showing_username">Changer de nom affiché : </label><br/>
                <input id="showing_username" type="text" placeholder="Choisissez un nom d'affichage" maxLength="100" value={showing_username}
                          onChange={evt => setShowingName(evt.target.value)} />
                <br/>

                <label htmlFor="showing_username">Changer de type d'utilisateur : </label><br/>
                <select className="type-select" id="type" name="user_type" onChange={evt => setType(evt.target.value)}>
                  <option value="VIEW">Mélomane</option>
                  <option value="STRM">Streamer</option>
                  <option value="MUSC">Musicien</option>
                </select>
                <br/><br/>

                <label htmlFor="showing_username">Souhaitez-vous partager votre écoute ? </label><br/>
                <select id="type" name="type" onChange={evt => setSharing(evt.target.value)}>
                  <option value={false}>Non</option>
                  <option value={true}>Oui</option>
                </select>
                <br/>
                <br/>
                { savedStatus ? <span className="connected">Modifications réussies</span> : null }
                <button onClick={() => updateUser()} className="save-button">Sauvegarder les modifications</button>
                <br/>

            </div>


            <div className="password-change hidden" style={{display: showPassword ? 'block' : 'none'}}>

                <label  htmlFor="password">Changer de mot de passe</label><br/>
                <input id="password" type="password" placeholder="Mot de passe" value={password}
                        onChange={evt => setPassword(evt.target.value)} />

                <label  htmlFor="password">Confirmer le nouveau mot de passe</label><br/>
                <input id="newpassword" type="password" placeholder="Confirmer le mot de passe" value={newpassword}
                        onChange={evt => setNewpassword(evt.target.value)} />
                <br/>
                <button onClick={() => null} className="save-button">Sauvegarder les modifications</button>
                <br/>

            </div>


            <div className="email-change hidden" style={{display: showEmail ? 'block' : 'none' }} >

                <label  htmlFor="password">Changer d'email</label><br/>
                <input id="newpassword" type="email" placeholder="Changer d'email" value={email}
                        onChange={evt => setEmail(evt.target.value)} />
                <br/>
                <button onClick={() => null} className="save-button">Sauvegarder les modifications</button>
                <br/>

            </div>

            <div className="rooms-change hidden" style={{display: showRooms ? 'block' : 'none' }} >

                <label  htmlFor="password">Liste de vos salons suivis</label><br/>

                <br/>
                <button onClick={() => null} className="save-button">Sauvegarder les modifications</button>
                <br/>

            </div>

            <div className="connexion-change hidden" style={{display: showConnexion ? 'block' : 'none' }}>

                <span  htmlFor="connexionstreaming">Connexion à Spotify pour uniquement partager votre écoute</span><br/>
                <a className="connections" href={redirectStreaming}>
                  <button>Connexion à Spotify</button>
                </a>
                {
                  streamingIsokay ? <span className="connected"> Connexion déjà établie</span>
                  : null
                }

                <br/><br/>

                <span  htmlFor="connexionlistening">Connexion à Spotify pour uniquement écouter</span><br/>
                <a className="connections" href={redirectListening}>
                  <button>Connexion à Spotify</button>
                </a>
                {
                  listenIsokay ? <span className="connected"> Connexion déjà établie</span>
                  : null
                }
                <br/>

                <span style={{color: 'red', fontSize:20}}> Attention, si vous ne possédez pas de compter Premium, vous ne pourrez pas profiter pleinement du site</span>

                <br/><br/>
                <span  htmlFor="connexiontwitch">Connexion à Twitch</span><br/>
                <button onClick={() => null}>Connexion à Twitch</button><br/>
                <span  htmlFor="connexiontwitter">Connexion à Twitter</span><br/>
                <button onClick={() => null}>Connexion à Twitter</button><br/>

            </div>


          </div>
        </div>

      </React.Fragment>
    </div>

  );
}

export default Profile;


/*
import queryString from 'query-string';

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var key = generateRandomString(16);
setToken('spotify_auth_state', key)

const redirect = 'https://accounts.spotify.com/authorize?client_id='+process.env.REACT_APP_CLIENT_ID+'&response_type=code&redirect_uri='+process.env.REACT_APP_REDIRECT_URI+'&scope=streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state&state='+token['spotify_auth_state']

useEffect(() => {
  var key = generateRandomString(16);
  if (token['spotify_auth_state'] === undefined) {
    setToken('spotify_auth_state', key)
  }
  let url = window.location.search;
  let params = queryString.parse(url);
  if (params.code && params.state === token['spotify_auth_state'] ){
    refreshResp(params.code);
    setRefreshokay(true);
  }
}, [])

const refreshResp = async (code) => {

  const resp = await SPOTAPI.getRefreshToken(code)
  if (resp.error) {
    deleteToken('spotify_auth_state')
  }
  var temp_refresh_token = CryptoAES.encrypt(resp.refresh_token_listening, process.env.REACT_APP_ENCRYPTKEY).toString();
  await setRefreshToken(temp_refresh_token)
}

useEffect( () => {
  const regex = /[^A-Za-z0-9]/g;
  const found = username.match(regex);
  if (found !== null && found.length>0) setWrongUser(true);
  else setWrongUser(false)
}, [username])

useEffect( () => {
  const regex = / /g;
  const found = password.match(regex);
  if (found !== null && found.length>0) setWrongPw(true);
  else setWrongPw(false)
}, [password])

*/
