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
    if(!token['streamify-token'] || token['streamify-token'] === 'undefined') {window.location.href='/'; deleteToken('streamify-token');};
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
      <header className="App-header">
        <h1>
          <FontAwesomeIcon icon={faSpotify} />
          <span> Streamify </span>
        </h1>
        <FontAwesomeIcon icon={faSignOutAlt} onClick={logoutUser}/>

      </header>
      <div className="upcoming">
        <ul><span>Mises à jours à venir</span>
          <li>Page profil</li>
          <li>Création de salons d'écoutes privés ou publiques</li>
          <li>Meilleure gestion des scopes de l'api Spotify pour mieux protéger les usagers</li>
        </ul>
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
