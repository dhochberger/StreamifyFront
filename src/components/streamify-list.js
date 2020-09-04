import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

import { faSpotify, faTwitch } from '@fortawesome/free-brands-svg-icons';
import './components.css';

function StreamifyList(props) {

  const streamerClicked = user => evt => {
    props.streamerClicked(user)
  }

  return (
    <div>
    <u>Liste des utilisateurs</u><br/><br/>
    { props.users && props.usersIsplaying && (props.usersIsplaying.length !== 0) && props.users.map( (user, index) => {
           if (user.sharing === true){
             var length = props.usersIsplaying.length;
             for (var i = 0; i<length; i++)
              if (props.usersIsplaying[i].user.user === user.user && !props.usersIsplaying[i].access_token.error)
               return (
                  <div key={index} className="userlist-item">
                      <FontAwesomeIcon icon={faSpotify} className={props.usersIsplaying[i].spotify_api.is_playing ? 'green' : 'red'}/>
                      <FontAwesomeIcon icon={faTwitch} className={false ? 'purple' : 'red'}/>
                      <span onClick={streamerClicked(props.usersIsplaying[i])}>{user.get_username}<br/></span>
                      <span className='usertype' style={{color:'#777777'}}>{user.get_type}</span>
                      <br/>
                  </div>
                )

            }
        })
      }
    </div>
  )
}

export default StreamifyList;
