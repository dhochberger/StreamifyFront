import React, { useState, useEffect } from 'react';
import { API } from '../api-service';
import { SPOTAPI } from '../spotify-api-service';
import { useCookies } from 'react-cookie';
import './components.css';
import queryString from 'query-string';

import CryptoAES from 'crypto-js/aes'

function Auth(){

  let user, usernameGlobal;

  const [ username, setUsername ] = useState('');
  const [ wrongUser, setWrongUser ] = useState(false);
  const [ password, setPassword ] = useState('');
  const [ wrongPw, setWrongPw ] = useState(false);

  const [ user_type, setType ] = useState('VIEW');
  const [ showing_username, setShowingName ] = useState('');
  const [ sharing, setSharing ] = useState(false);

  const [ refresh_token, setRefreshToken ] = useState('');
  const [ refreshisokay, setRefreshokay ] = useState(false);
  const [ registerisokay, setRegisterokay ] = useState(true);

  const [ isLoginView, setIsLoginView ] = useState(true);
  const [ tokenDefined, isTokenDefined ] = useState(true);
  //const [ usernameExists, isUsernameExists ] = useState(true);

  const [ token, setToken, deleteToken ] = useCookies(['streamify-token','spotify_auth_state']);

  const isDisabled = username.length === 0 || password.length === 0 || wrongUser || wrongPw
  const isDisabledRegistered = showing_username.length === 0 || refresh_token === '' || isDisabled;

  useEffect( () => {
    if(token['streamify-token'] && token['streamify-token'] !== 'undefined' && registerisokay) window.location.href = '/streamify';
    if(!token['streamify-token'] || token['streamify-token'] === 'undefined') {isTokenDefined(false);deleteToken('streamify-token');}
  }, [token, deleteToken, isDisabledRegistered])

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

  const loginClicked = async () => {
    if(isLoginView){
      await API.loginUser({username, password})
        .then( async resp => await setToken('streamify-token', resp.token)
                                  .then( () => window.location.href = '/streamify' ))
    }
    else {
      setRegisterokay(false);
      await API.loginUser({username, password})
        .then( async resp => await setToken('streamify-token', resp.token) )
        .then( async () => await API.registerUserdatas({user, user_type, showing_username, sharing, refresh_token})
                                                      .then( () => window.location.href = '/streamify' ) )
    }
  }

  const registerClicked = async () => {
    await API.registerUser({username, password})
      .then( resp => {user = resp.id;
                      usernameGlobal = resp.username})
      .then( () => {if(showing_username===''){
                        setShowingName(usernameGlobal);
                      }
                    }
                  )
      .then( () => loginClicked())
  }

  var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

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

  useEffect( () => {
    if (refreshisokay) setIsLoginView(false)
  }, [refreshisokay])

  const refreshResp = async (code) => {

    const resp = await SPOTAPI.getRefreshToken(code)
    if (resp.error) {
      deleteToken('spotify_auth_state')
    }
    var temp_refresh_token = CryptoAES.encrypt(resp.refresh_token, process.env.REACT_APP_ENCRYPTKEY).toString();
    await setRefreshToken(temp_refresh_token)

  }
  return (
    <div className="App">
      <header className="App-header">
        {isLoginView ? <h1>Connexion</h1> : <h1>Création</h1>}
      </header>
      <div className="login-container">
        {isLoginView ? null :
          <React.Fragment>
            <a className="connections" href={redirect}>
              <button> Connexion à Spotify</button>
            </a>
                <br/><span className="white">Connectez vous à Spotify avant de créer votre compte, puis revenez sur cette page</span><br/><br/>
          </React.Fragment>
        }

        { !isLoginView && !refreshisokay ? <div><span className="red">Veuillez vous connecter à Spotify pour profiter du site</span></div> : null }

        <br/>
        <label htmlFor="username">Identifiant de connexion</label><br/>
        <input id="username" type="text" placeholder="Identifiant de connexion" value={username}
                onChange={ evt => setUsername(evt.target.value)}/>
        {wrongUser ? <span className="red">Caractère spécial interdit dans l'identifiant</span> : null }
                <br/>

        <label  htmlFor="password">Mot de passe</label><br/>
        <input id="password" type="password" placeholder="Mot de passe" value={password}
                onChange={evt => setPassword(evt.target.value)} />
        {wrongPw ? <span className="red">Caractère spécial interdit dans l'identifiant</span> : null }
        <br/>

        {isLoginView ? null :
          <React.Fragment>
              <label htmlFor="showing_username">Nom affiché</label><br/>
              <div className="inline-error">
                <input id="showing_username" type="text" placeholder="Choisissez un nom d'affichage" maxLength="100" value={showing_username}
                        onChange={evt => setShowingName(evt.target.value)} />
                { showing_username.length===0 ? <span className="red">Choisissez un nom d'affichage (Peut être le même que votre identifiant)</span> : null }
              </div>
              <br/>

              <select id="type" name="user_type" onChange={evt => setType(evt.target.value)}>
                <option value="VIEW" defaultValue>Mélomane</option>
                <option value="STRM">Streamer</option>
                <option value="MUSC">Musicien</option>
              </select>
              <span className="white">Qu'êtes-vous ?</span><br/>
              <select id="type" name="type" onChange={evt => setSharing(evt.target.value)}>
                <option value={false} defaultValue>Non</option>
                <option value={true}>Oui</option>
              </select>
              <span className="white">Souhaitez-vous partager votre écoute ?</span><br/>
              <br/>
            </React.Fragment>
        }

        {isLoginView ? <button onClick={loginClicked} disabled={isDisabled}>Connexion</button> :
                       <button onClick={registerClicked} disabled={isDisabledRegistered}>Création</button>
        }

        {isLoginView ?
          <p onClick={() => setIsLoginView(false)}>Pas de compte ? <span className="loggedin">Enregistrez vous</span></p> :
          <p onClick={() => setIsLoginView(true)}>Vous avez un compte ? <span className="loggedin">Connectez vous</span></p>
        }

        {tokenDefined ? '' : <span className="red">Un problème est survenu, l'identifiant est déjà utilisé, contient un caractère interdit ou n'existe pas, ou le mot de passe est faux</span>}


      </div>

    </div>
  )
}

export default Auth;
