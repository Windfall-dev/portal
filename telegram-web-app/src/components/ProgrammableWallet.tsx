import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export const ProgrammableWallet: React.FC = () => {
  const [sdk, setSdk] = useState<W3SSdk | null>(null);
  const [appId, setAppId] = useState<string>("");
  const [userToken, setUserToken] = useState<string>("");
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [challengeId, setChallengeId] = useState<string>("");

  useEffect(() => {
    setSdk(new W3SSdk());

    // Set initial values from localStorage
    setAppId(window.localStorage.getItem("appId") || "someAppId");
    setUserToken(window.localStorage.getItem("userToken") || "someUserToken");
    setEncryptionKey(
      window.localStorage.getItem("encryptionKey") || "someEncryptionKey"
    );
    setChallengeId(
      window.localStorage.getItem("challengeId") || "someChallengeId"
    );
  }, []);

  const onChangeHandler = useCallback(
    (setState: React.Dispatch<React.SetStateAction<string>>, key: string) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setState(value);
        window.localStorage.setItem(key, value);
      },
    []
  );

  const onSubmit = useCallback(() => {
    if (!sdk) return;
    sdk.setAppSettings({ appId });
    sdk.setAuthentication({ userToken, encryptionKey });
    sdk.execute(challengeId, (error, result) => {
      if (error) {
        toast.error(`Error: ${error?.message ?? "Error!"}`);
        return;
      }
      toast.success(`Challenge: ${result?.type}, Status: ${result?.status}`);
    });
  }, [sdk, appId, userToken, encryptionKey, challengeId]);

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="appId"
          className="block text-sm font-medium text-gray-700"
        >
          App Id
        </label>
        <input
          type="text"
          id="appId"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={appId}
          onChange={onChangeHandler(setAppId, "appId")}
        />
      </div>
      <div>
        <label
          htmlFor="userToken"
          className="block text-sm font-medium text-gray-700"
        >
          User Token
        </label>
        <input
          type="text"
          id="userToken"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={userToken}
          onChange={onChangeHandler(setUserToken, "userToken")}
        />
      </div>
      <div>
        <label
          htmlFor="encryptionKey"
          className="block text-sm font-medium text-gray-700"
        >
          Encryption Key
        </label>
        <input
          type="text"
          id="encryptionKey"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={encryptionKey}
          onChange={onChangeHandler(setEncryptionKey, "encryptionKey")}
        />
      </div>
      <div>
        <label
          htmlFor="challengeId"
          className="block text-sm font-medium text-gray-700"
        >
          Challenge Id
        </label>
        <input
          type="text"
          id="challengeId"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={challengeId}
          onChange={onChangeHandler(setChallengeId, "challengeId")}
        />
      </div>
      <button
        onClick={onSubmit}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Verify Challenge
      </button>
    </div>
  );
};
