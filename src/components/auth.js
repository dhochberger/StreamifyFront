import React, { useState, useEffect } from 'react';
import { API } from '../api-service';
import { useCookies } from 'react-cookie';
import './components.css';

function Auth(){

  const [ username, setUsername ] = useState('');
  const [ wrongUser, setWrongUser ] = useState(false);
  const [ password, setPassword ] = useState('');
  const [ wrongPw, setWrongPw ] = useState(false);

  const [ isLoginView, setIsLoginView ] = useState(true);
  const [ tokenDefined, isTokenDefined ] = useState(true);
  //const [ usernameExists, isUsernameExists ] = useState(true);

  const [ token, setToken, deleteToken ] = useCookies(['streamify-token']);

  const isDisabled = username.length === 0 || password.length === 0 || wrongUser || wrongPw

  useEffect( () => {
    if(token['streamify-token'] && token['streamify-token'] !== 'undefined') window.location.href = '/streamify';
    if(!token['streamify-token'] || token['streamify-token'] === 'undefined') {isTokenDefined(false);deleteToken('streamify-token');}
  }, [token, deleteToken])

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
    await API.loginUser({username, password})
        .then( async resp => await setToken('streamify-token', resp.token)
                                  .then( () => window.location.href = '/streamify' ))
                                  .catch(error => console.log(error))
  }

  const registerClicked = async () => {
    await API.registerUser({username, password})
      .then( () => loginClicked())
  }

  return (
    <div className="App">
      <header className="App-header">
        {isLoginView ? <h1>Connexion</h1> : <h1>Création</h1>}
      </header>
      <div className="login-container">

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

        {isLoginView ? <button onClick={loginClicked} disabled={isDisabled}>Connexion</button> :
                       <button onClick={registerClicked} disabled={isDisabled}>Création</button>
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
