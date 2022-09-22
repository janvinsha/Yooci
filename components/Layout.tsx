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
import Header from "./Header";

import AppContext from "../context/AppContext";
import { GlobalStyle } from "../components";

import { Wallet, providers } from "ethers";
import { connect } from "@tableland/sdk";

import { create } from "ipfs-http-client";
import yoociContract from "../contracts/yoociContract.json";

const YOOCI_ADDRESS = "0xe3aF62eF372f66f66B38b7b13Fae84e9F5912574";
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
const organizationsTable = "organizations_80001_2138";
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

  const getProfile = async (id) => {
    try {
      // id int, address text, bio text, handle text
      console.log("GETTING PROFILE........");
      const signer = tblWallet.connect(tblProvider);
      const tbl = await connect({ signer });
      const { rows } = await tbl.read(
        `SELECT * FROM ${usersTable} WHERE id = '${id}'`
      );
      console.log(rows);
      return rows;
    } catch (err) {
      console.log(err), "THIS IS THE ERROR";
    }
  };

  const updateProfile = async (profile) => {
    try {
      console.log("UPDATING PROFILE.................");
      const signer = tblWallet.connect(tblProvider);
      const tbl = await connect({ signer });
      const getResponse = await getProfile(profile.id);
      if (!getResponse[0]) {
        console.log("CREATING BECAUSE NO USER FOUND", profile);
        const writeTx = await tbl.write(
          `INSERT INTO ${usersTable} VALUES ('${profile.id}', '${profile.bio}', '${profile.handle}','${profile.dp}','${profile.banner}',Organizations='${profile.organizations}',Verified='false')`
        );
        console.log(writeTx);
        return writeTx;
      } else {
        console.log("UPDATING BECAUSE USER FOUND", profile);
        const writeTx = await tbl.write(`UPDATE ${usersTable}
        SET Handle='${profile.handle}', Bio='${profile.bio}', Dp='${profile.dp}', Banner='${profile.banner}',Organizations='${profile.organizations}',
        WHERE id = '${profile.id}'`);
        console.log(writeTx);
        return writeTx;
      }
    } catch (error) {
      console.log(error);
    }
  };
  const changeAccess = async (organizations) => {
    try {
      console.log("UPDATING PROFILE.................");
      const signer = tblWallet.connect(tblProvider);
      const tbl = await connect({ signer });

      const writeTx = await tbl.write(`UPDATE ${usersTable}
        SET Organizations='${JSON.stringify(organizations)}'`);
      console.log(writeTx);
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
  const createTable = async () => {
    try {
      console.log("CREATING TABLE ..........");

      const signer = tblWallet.connect(tblProvider);

      const tbl = await connect({ signer });

      console.log(tbl, "THIS IS THE TBL");

      // const { name, txnHash } = await tbl.create(
      //   `id text,bio text, handle text, dp text, banner text, organizations text, verified text, primary key (id)`, // Table schema definition
      //   `users` // Optional prefix; used to define a human-readable string
      // );

      const { name, txnHash } = await tbl.create(
        `id text, name text,description text,dp text,banner text, address text,patients text,verified text,owner text, primary key (id)`, // Table schema definition
        `organizations` // Optional prefix; used to define a human-readable string
      );

      console.log(name, txnHash, "HERE IS THE RESPONSE");
    } catch (error) {
      console.log(error, "THIS IS THE ERROR ");
    }
  };

  const getOrganizations = async () => {
    try {
      const signer = tblWallet.connect(tblProvider);
      const tbl = await connect({ signer });
      const { rows } = await tbl.read(`SELECT * FROM ${organizationsTable}`);
      console.log(rows);
      return rows;
    } catch (err) {
      console.log(err);
    }
  };
  const createOrganization = async (organization) => {
    const unique_id = uuid();

    try {
      const signer = tblWallet.connect(tblProvider);
      const tbl = await connect({ signer });
      const writeTx = await tbl.write(
        `INSERT INTO ${organizationsTable} VALUES ('${unique_id.toString()}', '${
          organization.name
        }', '${organization.description}','${organization.dp}','${
          organization.banner
        }','${organization.address}','','false','${organization.owner}')`
      );
      console.log(writeTx);
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
    const signer = tblWallet.connect(tblProvider);
    const tbl = await connect({ signer });
    const writeTx = await tbl.write(`UPDATE ${usersTable}
    SET Verified='true',
    WHERE id = '${account}'`);
    console.log(writeTx);
    return writeTx;
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
          createRecord,
          updateRecord,
          verifyUser,
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
