import useSWR from 'swr'
import { Amplify } from 'aws-amplify';
import Im from "immutable"


const fetcher = async (url) => {
    const user = await Amplify.Auth.currentAuthenticatedUser();
    const token = user?.signInUserSession?.idToken?.jwtToken

    console.log("Calling API", url)

    const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: token }
    })

    const _data = await response.json();
    console.log("Got API response from", url, _data)
    return Im.fromJS(_data)
}

const swrOptions = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
}

export default function useApi(url, args) {
    /*
    url may contain url parameters like /api/<region>/instance/<instance_id>
    args is an object with keyword url parameters like: {region: eu-west-2, instance_id: "abc123"}
    */
    const { data, error } = useSWR(url, fetcher, swrOptions)
  
    return {
      data: data,
      isLoading: !error && !data,
      isError: !!error,
      error
    }
}