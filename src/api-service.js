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

  static registerUserdatas(body) {

    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

  static getRefresh(token, user_id){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/${user_id}/get_refresh_token/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
  }

  static getMyToken(token, user_id){
    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/1/get_myself/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    })
    .then( resp => resp.json() )
  }


} // End class
