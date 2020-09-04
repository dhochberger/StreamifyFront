import { useState, useEffect } from 'react';
import { API } from '../api-service';
import { SPOTAPI } from '../spotify-api-service';
import { useCookies } from 'react-cookie';

import * as CryptoJS from 'crypto-js';
import CryptoAES from 'crypto-js/aes'

function useFetch() {

  const [users, setUsers] = useState([]);
  const [userDatas, setUserdatas] = useState([]);
  const [myself, setMyself] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [token] = useCookies(['streamify-token']);

  useEffect( () => {
    async function fetchData() {
      setLoading(true);
      setError();

      const data = await API.getUsers(token['streamify-token'])
                        .catch( err => setError(err))
      const myself_temp = await API.getMyToken(token['streamify-token'])
                          .catch(err => setError(err))

      const userDatas = []
      var temp_access_token = '';
      var temp_access_token_myself = '';
      var temp_is_playing = false;
      var myself = {};

      for (var i=0; i<data.length; i++){
        if ( data[i].get_refresh_token !== ""){

          var refresh_token = CryptoAES.decrypt(data[i].get_refresh_token, process.env.REACT_APP_ENCRYPTKEY).toString(CryptoJS.enc.Utf8);

          temp_access_token = await SPOTAPI.getAccessToken(refresh_token);

          var crypted_access = CryptoAES.encrypt(temp_access_token.access_token, process.env.REACT_APP_ENCRYPTACCESSKEY).toString();


          temp_is_playing = await SPOTAPI.getPlayingStreamer(temp_access_token.access_token);

          userDatas.push({user:data[i],
                            access_token:crypted_access,
                            spotify_api:temp_is_playing });
        }
        else userDatas.push({user:data[i],
                          access_token:'',
                          spotify_api:{'is_playing':false} });
      }

      var myself_token = CryptoAES.decrypt(myself_temp.get_refresh_token, process.env.REACT_APP_ENCRYPTKEY).toString(CryptoJS.enc.Utf8);
      var decrypt = 'U2FsdGVkX19xeBgzFJWOM4ahHNQFOcAU5IOH/CvnvEwFX086z666vVrIiDYBKE8pJ0IY4uZ5DQOQ9+E+7WiKxTvOMwzne2CiRU+gSYH0r+7DWfxPDBDHUsZTIAB7lYuVBNRgktmv5zAbgGALUge5tSjOdyP8LBG50cmwEGPhym3qZMXv4/ipAg6l4g6kLIbG1H29DIglqNaieZHif09ybw=='
      var temp_d = CryptoAES.decrypt(decrypt, process.env.REACT_APP_ENCRYPTKEY).toString(CryptoJS.enc.Utf8)


      temp_access_token_myself = await SPOTAPI.getAccessToken(myself_token);

      myself = {user:myself_temp,
                access_token:temp_access_token_myself.access_token}


      setUsers(data)
      setUserdatas(userDatas)
      setMyself(myself)
      setLoading(false);

    }

    function timer() {
      fetchData();
      setTimeout( () => {
          timer();
        }, 3500000)
    }

    timer();

  }, [token]);
  return [users, userDatas, myself, loading, error];
}

export { useFetch };
