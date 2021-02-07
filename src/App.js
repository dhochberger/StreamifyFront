import React, { useState, useEffect } from 'react';
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import StreamifyList from './components/streamify-list';
import UserDatasDetails from './components/streamify-detail';
import { useCookies } from 'react-cookie';
import { useFetch } from './hooks/useFetch';

function App() {

  const [users, setUsers] = useState([]);
  const [usersIsplaying, setUsersisplaying] = useState();
  const [myselfDatas, setMyself] = useState([]);

  //const [ to, setTO ] = useState(0)

  const [selectedUser, setSelectedUser] = useState(null);
  const [user, userDatas, myself, loading, error] = useFetch();

  const [token, deleteToken] = useCookies(['streamify-token'])

  useEffect( () => {
    setUsers(user);
    setUsersisplaying(userDatas)
    setMyself(myself)
  })

  useEffect( () => {
    if(!token['streamify-token'] || token['streamify-token'] === 'undefined') {deleteToken('streamify-token');window.location.href='/'; };
  }, [token] )

  const loadUser = userdatas => {
    setSelectedUser(userdatas);
    setUsersisplaying(userdatas.spotify_api.is_playing);
  }

  const logoutUser = () => {
    deleteToken('streamify-token');
  }

  if(loading) return <h1>Loading</h1>
  if(error) return <h1>Error loading list</h1>

  return (

    <div className="App">

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
      <div className="upcoming">
        <ul><span className="update">Mises à jours à venir</span>
          <li>Page profil complète (qui fonctionne entièrement en fait)</li>
          <li>Création de "salons" d'écoutes et following de comptes/salons afin de simplifier la recherche d'écoute</li>
          <li>Simplification de l'activation/désactivation du partage d'écoute(Ca sera probablement un bouton)</li>
          <li>Une interface plus responsive pour qu'elle ressemble à quelque chose partout</li>
        </ul><br/>
        <span className="update">J'le ferais quand j'aurai le temps, mais les cours là c'est chaud</span>
      </div>

      <div className="layout">

        <div className="userList">
          <StreamifyList users={users}
                         usersIsplaying={usersIsplaying}
                         streamerClicked={loadUser}/>
        </div>
        <div>
          <UserDatasDetails userdatas={selectedUser}
                            myselfDatas={myselfDatas}
                            streamerClicked={loadUser} />
        </div>

      </div>

    </div>

  );
}

export default App;
