export class API {

  static loginUser(body) {

    return fetch(`${process.env.REACT_APP_API_URL}/auth/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( body )
    }).then( resp => resp.json() )
  } // End updateQuestion

  static registerUser(body) {

    return fetch(`${process.env.REACT_APP_API_URL}/streamify/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( body )
    }).then( resp => resp.json() )

  } // End updateQuestion

  static registerUserdatas(token, body) {

    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify( body )
    })
    .then( resp => resp.json() )
  }

  static modifyUserdatas(body, user_id, token) {
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/${user_id}/updatedatas/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify( body )
    })
    .then( resp => resp.json() )
  }

  static getUsers(token){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
  }

  static getRefreshListening(token, user_id){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/${user_id}/get_refresh_token_listening/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
  }

  static getRefreshStreaming(token, user_id){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/${user_id}/get_refresh_token_streaming/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
  }

  static setRefreshToken(token, body, user_id){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/${user_id}/set_refresh_token/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify( body )
    })
    .then( resp => resp.json() )
  }

  static getMyToken(token, user_id){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/${user_id}/get_myself/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
    .catch( error => error())
  }

  static getMyId(token){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/users/1/get_myid/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
  }


} // End class
