import { useState, useEffect } from 'react';
import { API } from '../api-service';
import { SPOTAPI } from '../spotify-api-service';
import { useCookies } from 'react-cookie';

import * as CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes'

function useFetch(props) {

  const [users, setUsers] = useState([]);
  const [userDatas, setUserdatas] = useState([]);
  const [myself, setMyself] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [token] = useCookies(['streamify-token']);

  useEffect( () => {

    async function fetchMyself() {
      setLoading(true);
      setError();

      const myid = await API.getMyId(token['streamify-token'])
                  .catch(err => setError(err))
      const myself_temp = await API.getMyToken(token['streamify-token'], myid.user)
                          .catch(err => setError(err))

      var temp_access_token_myself = '';
      var myself = {};
      if (myself_temp.status === 400 || myself_temp.get_refresh_token_listening === "undefined"){
        myself = {user:myid,
                  access_token:''}
      }
      else {
        var myself_token = CryptoAES.decrypt(myself_temp.get_refresh_token_listening, process.env.REACT_APP_ENCRYPTKEY).toString(CryptoJS.enc.Utf8);

        temp_access_token_myself = await SPOTAPI.getAccessToken(myself_token);

        myself = {user:myself_temp,
                  access_token:temp_access_token_myself.access_token}
      }
      setUsers(null)
      setUserdatas(null)
      setMyself(myself)
      setLoading(false);
    }

    async function fetchData() {
      setLoading(true);
      setError();

      const myid = await API.getMyId(token['streamify-token'])
                  .catch(err => setError(err))


      const myself_temp = await API.getMyToken(token['streamify-token'], myid.user)
                                .catch(err => setError(err))

      const data = await API.getUsers(token['streamify-token'])
                        .catch( err => setError(err))

      const userDatas = []
      var temp_access_token = '';
      var temp_access_token_myself = '';
      var temp_is_playing = false;
      var myself = {};

      for (var i=0; i<data.length; i++){
        if ( data[i].get_refresh_token_streaming !== ""){

          var refresh_token = CryptoAES.decrypt(data[i].get_refresh_token_streaming, process.env.REACT_APP_ENCRYPTKEY).toString(CryptoJS.enc.Utf8);

          temp_access_token = await SPOTAPI.getAccessToken(refresh_token);

          temp_is_playing = await SPOTAPI.getPlayingStreamer(temp_access_token.access_token);

          userDatas.push({user:data[i],
                            access_token:temp_access_token.access_token,
                            spotify_api:temp_is_playing });
        }
        else userDatas.push({user:data[i],
                          access_token:'',
                          spotify_api:{'is_playing':false} });
      }

      if(myself_temp.status === 400)       myself = {user:myid,
                                                                    access_token:''}
      else {
            var myself_token = CryptoAES.decrypt(myself_temp.get_refresh_token_listening, process.env.REACT_APP_ENCRYPTKEY).toString(CryptoJS.enc.Utf8);

            temp_access_token_myself = await SPOTAPI.getAccessToken(myself_token);

            myself = {user:myself_temp,
                      access_token:temp_access_token_myself.access_token}
      }


      setUsers(data)
      setUserdatas(userDatas)
      setMyself(myself)
      setLoading(false);

    }

    function timer() {
      if (window.location.pathname === "/profile"){
        fetchMyself();
      }
      else {
        fetchData();
        setTimeout( () => {
            timer();
          }, 3500000)
      }
    }

    timer();

  }, [token]);

  return [users, userDatas, myself, loading, error];
}

export { useFetch };
