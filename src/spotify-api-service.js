import qs from 'querystring'

export class SPOTAPI {

  static getAccessToken(refresh_token) {

    return fetch(`https://accounts.spotify.com/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: qs.stringify({
        refresh_token: refresh_token,
        client_id: process.env.REACT_APP_CLIENT_ID,
        client_secret: process.env.REACT_APP_CLIENT_SECRET,
        grant_type: 'refresh_token',
      })
    })
    .then( resp => resp.json() )

  } // End updateQuestion

  // redirect_uri = process.env.REACT_APP_REDIRECT_URI
  static getRefreshToken(code){
    let buffer = new Buffer(process.env.REACT_APP_CLIENT_ID+':'+process.env.REACT_APP_CLIENT_SECRET)
    let b64client = buffer.toString('base64')
    return fetch (`https://accounts.spotify.com/api/token`, {
      method:'POST',
      headers: {
        'Authorization': `Basic ${b64client}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: qs.stringify({
        redirect_uri: process.env.REACT_APP_REDIRECT_PROFILE_URI,
        code: code,
        grant_type: 'authorization_code',
      }),
    })
    .then(resp => resp.json())
  }

  static getPlayingStreamer(access_token){

    return fetch(`https://api.spotify.com/v1/me/player`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })
    .then( (resp) => {if (resp.status !== 200) return {is_playing:false};
                      else return resp.json()})
    .catch(error => error)
  }

  static getDevices(access_token){

    return fetch(`https://api.spotify.com/v1/me/player/devices`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })
    .then( resp => resp.json() );
  }

 static getCurrentTrack(access_token){
   return fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
       method: 'GET',
       headers: {
         'Authorization': `Bearer ${access_token}`,
         'Content-Type': 'application/json',
       },
     })
     .then( (resp) => resp.json())
     .catch(error => error)
 }
 
  static transferPlayback(id, access_token){
    let array = []
    array.push(id)
    return fetch(`https://api.spotify.com/v1/me/player`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({'device_ids':array,
      }),
    })
  }

  static volumePlayback(id, volume, access_token){
    let array = []
    array.push(id)
    return fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}&device_id=${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  static playSong(deviceId, uri, position_ms, access_token){
    return fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method:'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({'uris':uri,
                           'position_ms':position_ms,
      }),
    })
  }

  static pause(access_token){
    return fetch(`https://api.spotify.com/v1/me/player/pause`, {
      method:'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })
  }

  static play(access_token){
    return fetch(`https://api.spotify.com/v1/me/player/play`, {
      method:'PUT',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
  }

  static getMe(access_token){
    return fetch(`https://api.spotify.com/v1/me`, {
      method:'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })
    .then( resp => resp.json() );
  }

  static getRefreshStreaming(){
    return fetch(`https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=user-read-email user-read-playback-state`,
      {
        method:'GET',
    })
  }

  static getRefreshListening(){
    return fetch(`https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&scope=streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state`,
      {
        method:'GET',
    })
  }



/*
https://accounts.spotify.com/authorize?
client_id=f33c2ba83cf643bd9c9b815a8cffda8d
response_type=code
redirect_uri=http://localhost:3000/
scope=streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state
*/
/*
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
  form: {
    grant_type: 'refresh_token',
    refresh_token: refresh_token
  },
  json: true
  var client_id = 'f33c2ba83cf643bd9c9b815a8cffda8d'; // Your client id
  var client_secret = 'd29b9968422d46fd81124b626bed39d0'; // Your secret
  */
/*
  static registerUser(body, token) {

    return fetch(`${process.env.REACT_APP_API_URL}/streamify/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify( body )
    }).then( resp => resp.json() )

  } // End updateQuestion

  static registerUserdatas(body, token) {

    return fetch(`${process.env.REACT_APP_API_URL}/streamify/userdatas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify( body )
    })
    .then(resp => console.log(body))
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
*/
} // End class
