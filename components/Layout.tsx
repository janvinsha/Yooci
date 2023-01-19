import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "@0xsequence/web3modal";
const UAuthWeb3Modal = require("@uauth/web3modal");
import UAuthSPA from "@uauth/js";
import { sequence } from "0xsequence";
import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import styled from "styled-components";
import { motion } from "framer-motion";
import { v4 as uuid } from "uuid";
import { Database } from "@tableland/sdk";
import Header from "./Header";
import AppContext from "../context/AppContext";
import { GlobalStyle } from "../components";
import { Wallet, providers } from "ethers";
import { connect } from "@tableland/sdk";
import { create } from "ipfs-http-client";
import yoociContract from "../contracts/yoociContract.json";
import notify from "../hooks/notification";
const YOOCI_ADDRESS = "0xe3aF62eF372f66f66B38b7b13Fae84e9F5912574";
const YOOCI_SKALE_ADDRESS = "0x483B7167F4aA81FFF2AAB4c7A1cc9a9079A562Dd";
const projectId = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_PROJECT_SECRET;

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
interface Props {
  children: any;
}

const uauthOptions: UAuthWeb3Modal.IUAuthOptions = {
  clientID: "62308199-81a7-4592-bbce-e597fddfb122",
  redirectUri: "https://yooci.vercel.app",
  scope: "openid wallet",
};

let web3Modal;

if (typeof window != "undefined") {
  // let connector = UAuthWeb3Modal.connector;
  let providerOptions = {
    "custom-uauth": {
      display: UAuthWeb3Modal.display,

      connector: UAuthWeb3Modal?.connector,

      package: UAuthSPA,

      options: uauthOptions,
    },
    walletconnect: {
      package: WalletConnect,
      options: {
        infuraId: "fdd5eb8e3a004c9c9caa5a91a48b92b6",
        chainId: 80001,
      },
    },
    coinbasewallet: {
      package: CoinbaseWalletSDK,
      options: {
        appName: "Kasuwa",
        infuraId: "fdd5eb8e3a004c9c9caa5a91a48b92b6",
        chainId: 80001,
      },
    },
    sequence: {
      package: sequence,
      options: {
        appName: "Kasuwa",
        defaultNetwork: "",
        chainId: 80001,
      },
    },
  };
  web3Modal = new Web3Modal({
    providerOptions,
    cacheProvider: true,
    theme: `dark`,
  });
  UAuthWeb3Modal?.registerWeb3Modal(web3Modal);
}

const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const tblWallet = new Wallet(privateKey);
const tblProvider = new providers.AlchemyProvider("maticmum", alchemyKey);
const usersTable = "users_80001_2084";
const organizationsTable = "organizations_80001_3007";
const Layout = ({ children }: Props) => {
  console.log(
    process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY,
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    "CHECKING THE ENVS"
  );
  const [theme, setTheme] = useState(true);
  interface Bool {}
  const [currentAccount, setCurrentAccount] = useState();
  const [provider, setProvider] = useState();
  const [chainId, setChainId] = useState();
  const [isMember, setIsMember] = useState(false);
  const [offerItems, setOfferItems] = useState<OfferItem[]>([]);
  const [considerationItems, setConsiderationItems] = useState<
    ConsiderationItem[]
  >([]);
  useEffect(() => {
    setTheme(JSON.parse(localStorage.getItem("theme") || "true"));
  }, []);
  const changeTheme = () => {
    setTheme(!theme);
    localStorage.setItem("theme", JSON.stringify(!theme));
  };

  const poll = async () => {
    if (web3Modal.cachedProvider) {
      let wallet = await web3Modal.connect();
      const tProvider = new ethers.providers.Web3Provider(wallet);
      setProvider(tProvider);
      const accounts = await tProvider?.listAccounts();
      console.log("CHECKING ACCOUNT ADDRESS", accounts[0]);
      //   console.log('Accounts', accounts);
      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        console.log("Found an authorized account:", account);
        const signer = tProvider.getSigner();
        let chainID = await signer.getChainId();
        setChainId(chainID);
        if (chainID == 80001) {
        } else {
          console.log("Wrong chain ID");
        }
        let eventId = 123;
        const { statusCode } = await axios.get(
          `https://api.poap.tech/actions/scan/${currentAccount}/${eventId}`
        );

        ///This app is only people that have atteneded HackFs hackathon
        setIsMember(statusCode === 200 ? true : false);
      } else {
        console.log("No authorized account found");
      }
    } else {
      setCurrentAccount();
    }
  };

  const connectWallet = async () => {
    if (web3Modal.cachedProvider) {
      web3Modal.clearCachedProvider();
    }
    try {
      const wallet = await web3Modal.connect();

      const tProvider = new ethers.providers.Web3Provider(wallet);

      setProvider(tProvider);
      const accounts = await tProvider.listAccounts();
      const signer = tProvider.getSigner();
      setCurrentAccount(accounts[0]);
      poll();
    } catch (error) {
      console.log("CONNECT ERROR HERE", error);
    }
  };

  const disconnectWallet = async () => {
    const wallet = await web3Modal.connect();
    web3Modal.clearCachedProvider();
    setCurrentAccount(null);
  };
  useEffect(() => {
    poll();
  }, []);

  const getProfile = async () => {
    try {
      const db = Database.readOnly("maticmum"); // Polygon Mumbai testnet
      // id int, address text, bio text, handle text
      console.log("GETTING PROFILE........");
      const { results } = await db
        .prepare(`SELECT * FROM ${usersTable} WHERE id = '${currentAccount}'`)
        .all();
      console.log("WHAT IS THE GETPROFILE RETURNING", results);

      return results;
    } catch (err) {
      console.log(err), "THIS IS THE ERROR";
    }
  };
  const updateProfile = async (profile) => {
    try {
      const signer = tblWallet.connect(tblProvider);
      const db = new Database({ signer });
      console.log("UPDATING PROFILE.................");

      const getResponse = await getProfile(profile.id);
      if (!getResponse[0]) {
        console.log("CREATING BECAUSE NO USER FOUND", profile);
        const { meta: insert } = await db
          .prepare(
            `INSERT INTO ${usersTable} (id, bio, handle, dp, banner,organizations, verified) VALUES (?, ?, ?, ?, ?,?,?);`
          )
          .bind(
            profile.id,
            profile.bio,
            profile.handle,
            profile.dp,
            profile.banner,
            "",
            false
          )
          .run();
        await insert?.txn?.wait();
      } else {
        console.log("UPDATING BECAUSE USER FOUND", profile);
        const { meta: update } = await db
          .prepare(
            `UPDATE 
            ${usersTable} SET bio = ?2, handle = ?3, dp = ?4, banner = ?5 WHERE id = ?1`
          )
          .bind(
            profile.id,
            profile.bio,
            profile.handle,
            profile.dp,
            profile.banner
          )
          .run();

        await update?.txn?.wait();
      }
      const { results } = await db
        .prepare(`SELECT * FROM ${usersTable};`)
        .all();
      notify({ title: "Profile edited successfully", type: "success" });
      return results;
    } catch (error) {
      console.log(error);
    }
  };

  const changeAccess = async (organizations) => {
    try {
      const signer = tblWallet.connect(tblProvider);
      const db = new Database({ signer });

      const { meta: update } = await db
        .prepare(
          `UPDATE 
        ${usersTable} SET organizations = ?2 WHERE id = ?1`
        )
        .bind(currentAccount, JSON.stringify(organizations))
        .run();

      await update?.txn?.wait();
      return writeTx;
    } catch (error) {
      console.log(error);
    }
  };

  const getRecord = async (address) => {
    const wallet = await web3Modal.connect();
    const tProvider = new ethers.providers.Web3Provider(wallet);
    try {
      const signer = tProvider.getSigner();
      const connectedContract = new ethers.Contract(
        YOOCI_ADDRESS,
        yoociContract.abi,
        signer
      );
      let tx = await connectedContract.getRecord(address);

      return tx;
    } catch (error) {
      console.log(error);
    }
  };

  const getOrganizations = async () => {
    try {
      const db = Database.readOnly("maticmum"); // Polygon Mumbai testnet

      const { results } = await db
        .prepare(`SELECT * FROM ${organizationsTable};`)
        .all();
      console.log(results);

      return results;
    } catch (err) {
      console.log(err);
    }
  };
  const getOrganization = async (orgId) => {
    try {
      const db = Database.readOnly("maticmum"); // Polygon Mumbai testnet

      const { results } = await db
        .prepare(`SELECT * FROM ${organizationsTable} WHERE id = '${orgId}'`)
        .all();
      console.log(results);

      return results;
    } catch (err) {
      console.log(err);
    }
  };
  const updateOrganization = async (organization) => {};

  const createOrganization = async (organization) => {
    const unique_id = uuid();
    console.log(organization, "THIS IS THE ORGANIZATION");

    const signer = tblWallet.connect(tblProvider);
    const db = new Database({ signer });

    const { meta: insert } = await db
      .prepare(
        `INSERT INTO ${organizationsTable} (id, name, description, dp, banner, address, verified, owner) VALUES (?, ?, ?, ?, ?);`
      )
      .bind(
        unique_id.toString(),
        organization?.name,
        organization?.description,
        organization?.dp,
        organization?.banner,
        organization?.address,
        false,
        organization?.owner
      )
      .run();
    await insert?.txn?.wait();
    notify({ title: "Organization created successfully", type: "success" });
  };

  const createTable = async () => {
    try {
      const signer = tblWallet.connect(tblProvider);
      const db = new Database({ signer });

      const { meta: create } = await db
        .prepare(
          "CREATE TABLE organizations (id integer primary key, name text, description text, dp text, banner text, address text, verified text, owner text);"
        )
        .run();
    } catch (err) {
      console.log(err);
    }
  };

  const createRecord = async (tokenURI) => {
    const wallet = await web3Modal.connect();
    const tProvider = new ethers.providers.Web3Provider(wallet);
    try {
      const signer = tProvider.getSigner();
      const connectedContract = new ethers.Contract(
        YOOCI_ADDRESS,
        yoociContract.abi,
        signer
      );
      let tx = await connectedContract.createRecord(tokenURI);
      console.log("RECORDD CREATED HEERE", tx);
      return tx;
    } catch (error) {
      console.log(error);
    }
  };
  const updateRecord = async (tokenURI) => {
    const wallet = await web3Modal.connect();
    const tProvider = new ethers.providers.Web3Provider(wallet);
    try {
      const signer = tProvider.getSigner();
      const connectedContract = new ethers.Contract(
        YOOCI_ADDRESS,
        yoociContract.abi,
        signer
      );
      let tx = await connectedContract.updateRecord(tokenURI);
      console.log("RECORDD UPDATED HEERE", tx);
      return tx;
    } catch (error) {
      console.log(error);
    }
  };
  const verifyUser = async (account) => {
    try {
      const signer = tblWallet.connect(tblProvider);
      const db = new Database({ signer });

      const { meta: update } = await db
        .prepare(
          `UPDATE 
        ${usersTable} SET verified = ?2 WHERE id = ?1`
        )
        .bind(account, true)
        .run();

      await update?.txn?.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOrganization = async (account) => {
    try {
      const signer = tblWallet.connect(tblProvider);
      const db = new Database({ signer });

      const { meta: update } = await db
        .prepare(
          `UPDATE 
        ${organizationsTable} SET verified = ?2 WHERE id = ?1`
        )
        .bind(account, true)
        .run();

      await update?.txn?.wait();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <StyledLayout>
      <AppContext.Provider
        value={{
          theme,
          changeTheme,
          connectWallet,
          currentAccount,
          disconnectWallet,
          createTable,
          getProfile,
          updateProfile,
          getRecord,
          createOrganization,
          getOrganizations,
          getOrganization,
          createRecord,
          updateRecord,
          verifyUser,
          verifyOrganization,
          updateOrganization,
        }}
      >
        <GlobalStyle theme={theme} />
        <Header />
        {children}
      </AppContext.Provider>
    </StyledLayout>
  );
};
const StyledLayout = styled(motion.div)``;

export default Layout;
