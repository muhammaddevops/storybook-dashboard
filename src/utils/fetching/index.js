import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
// import { ReloadOutlined, SyncOutlined } from "@ant-design/icons"
import Im from "immutable";
import store from "traec/redux/store";

export const fetcher = async (url, method = "GET", data = {}) => {
  // const user = await Amplify.Auth.currentAuthenticatedUser();
  // const token = user?.signInUserSession?.idToken?.jwtToken;

  let state = store.getState();
  let token = state.getInPath("auth.token");

  let headers = {
    Authorization: token,
    "Content-Type": "application/json",
  };
  console.log("Calling API", method, url, headers);

  const response = await fetch(url, {
    method,
    headers,
    body: method == "GET" ? null : JSON.stringify(data),
  });

  const _data = await response.json();
  console.log("Got API response from", url, _data);

  return Im.fromJS(_data);
};

const swrOptions = {
  revalidate: false,
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

const swrMutateOptions = {
  revalidate: false,
  populateCache: true,
};

const urlFromArgs = (url, args) => {
  let requiredArgs = url.matchAll(/{(.*?)}/g);
  let _url = `${url}`;
  for (const [param, key] of requiredArgs) {
    if (!args || !args[key]) {
      return null;
    }
    _url = _url.replaceAll(param, args[key]);
  }
  return _url;
};

export default function useApi(url, args, genArgs) {
  let _url = urlFromArgs(url, args);
  console.log("Executing useApi", url, _url == url ? "" : _url);

  const props = useSWR(_url, fetcher, swrOptions);
  const { trigger, isMutating } = useSWRMutation(
    url,
    () => fetcher(url),
    swrMutateOptions
  );

  let { data, isLoading, error } = props;
  let isError = !isLoading && !!error;

  return {
    ...props,
    url: _url,
    isError,
    args: data && !isError && genArgs ? genArgs(data) : null,
    trigger,
    isMutating,
    isFetching: isLoading || isMutating,
  };
}

const getFetchArgs = (fetches) =>
  Object.values(fetches)
    .map((i) => i.args)
    .filter((i) => i)
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});

export function useApis(fetches, updateParams) {
  let args = getFetchArgs(fetches);
  if (updateParams) {
    updateParams(args);
  }
  console.log("useApis has arguments", args);
  return {
    fetches,
    urls: Object.values(fetches).map((i) => i.url),
    isLoading: () => Object.values(fetches).some((i) => i.isLoading),
    isMutating: () => Object.values(fetches).some((i) => i.isMutating),
    isFetching: () => Object.values(fetches).some((i) => i.isFetching),
    mutate: (keys) =>
      (keys || Object.keys(fetches)).map((key) => mutate(fetches[key]?.url)),
    trigger: (keys) =>
      (keys || Object.keys(fetches)).map((key) => fetches[key]?.trigger()),
    args,
  };
}

const hasUpdates = (update = {}, obj = {}) => {
  console.log("Checking objects for updates", update, obj);
  let newKeys = Im.Set(Object.keys(update)).subtract(Im.Set(Object.keys(obj)));
  if (newKeys.size) {
    return true;
  }
  for (let key of Object.keys(update)) {
    if (update[key] != obj[key]) {
      return true;
    }
  }
};

export function useApiParams(_params) {
  let [params, setParams] = useState(_params || {});

  const updateParams = (newParams) => {
    if (newParams && hasUpdates(newParams, params)) {
      console.log("Updating api parameter set");
      setParams({ ...params, ...newParams });
    }
  };

  return {
    params,
    updateParams,
    setParams,
  };
}

export function RefreshButton({ mutate, spin }) {
  return (
    <span style={{ float: "right", marginRight: "1em" }}>
      Refreshing
      {/* {spin ? (
                <SyncOutlined spin={true} />
            ) : (
                <ReloadOutlined onClick={() => mutate()} />
            )} */}
    </span>
  );
}
