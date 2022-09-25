import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import styled from "styled-components";
import CryptoJS from "crypto-js";
import { create } from "ipfs-http-client";
import { WidgetProps } from "@worldcoin/id";
import AppContext from "../context/AppContext";

import {
  UserNftCard,
  NftCard,
  EditProfileModal,
  Loader,
  Input,
  AccessModal,
} from "../components";
import { verify } from "crypto";
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

const WorldIDWidget = dynamic<WidgetProps>(
  () => import("@worldcoin/id").then((mod) => mod.WorldIDWidget),
  { ssr: false }
);

export default function Profile() {
  // Import private key & instantiate wallet

  const router = useRouter();

  const [listings, setListings] = useState();
  const [activeTab, setActiveTab] = useState("Health Records");
  const {
    currentAccount,
    theme,
    disconnectWallet,
    createTable,
    getProfile,

    getRecord,
    createRecord,
    updateRecord,
    verifyUser,
  } = useContext(AppContext);
  const [userNfts, setUserNfts] = useState([]);
  const [clickedNft, setClickedNft] = useState();

  const [profileModal, setProfileModal] = useState(false);
  const [accessModal, setAccessModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [foundUser, setFoundUser] = useState([]);
  const [contractRecords, setContractRecords] = useState();
  const [name, setName] = useState();
  const [weight, setWeight] = useState();
  const [height, setHeight] = useState();
  const [bloodGroup, setBloodGroup] = useState();
  const [genotype, setGenotype] = useState();
  const [creatingRecord, setCreatingRecord] = useState();

  const [viewRecord, setViewRecord] = useState(false);

  const getProfileNfts = async () => {
    let chainId = 137;

    if (currentAccount) {
      const { data } = await axios.get(
        `https://api.covalenthq.com/v1/${chainId}/address/${currentAccount}/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=false&key=ckey_a2341ac051bd419d815522ed217`
      );
      console.log("THIS IS THE NFTS OF THE USER", data?.data?.items, chainId);

      let nftsArray = data?.data?.items;
      let tempArray = [];
      for (let x of nftsArray) {
        if (x.type == "nft") {
          let testArray = [...x?.nft_data].map((y) =>
            Object.assign(
              {
                contract_name: x?.contract_name,
                contract_ticker_symbol: x?.contract_ticker_symbol,
                contract_address: x?.contract_address,
              },
              y
            )
          );
          tempArray = [...tempArray, ...testArray];
        }
      }
      console.log("LETS SEE THE CONTENTS OF THE TEMP ARRAY", tempArray);

      setUserNfts(tempArray);
    }
  };

  useEffect(() => {
    getProfileNfts();
    getUserProfile();
    getData();
  }, [currentAccount]);

  const getUserProfile = async () => {
    if (currentAccount) {
      const res = await getProfile(`${currentAccount}`);
      console.log("GET PRFOILE RESPOMSE HERE", res);
      setFoundUser(res?.[0]);
    }
  };
  const getData = async () => {
    let record = await getRecord(currentAccount);
    if (record?.isValue) {
      setContractRecords(record);
    }
    if (record?.tokenURI) {
      let { data } = await axios.get(record?.tokenURI);
      console.log("HERE IS THE HASH", data?.data);
      let bytes = CryptoJS.AES.decrypt(
        data?.data,
        process.env.NEXT_PUBLIC_CRYPTOJS_KEY
      );
      let originalText = bytes.toString(CryptoJS.enc.Utf8);
      console.log("HERE IS THE ORINIGAL TEXT", originalText);
      let dataJson = JSON.parse(originalText);
      console.log("THIS IS THE USERS DAATA IN JSON", dataJson);
      setName(dataJson?.name);
      setWeight(dataJson?.weight);
      setHeight(dataJson?.height);
      setBloodGroup(dataJson?.bloodGroup);
      setGenotype(dataJson?.genotype);
    }

    console.log(
      "HERE IS THE RECORD",
      record,
      record?.isValue,
      record?.tokenURI
    );
  };

  console.log("THIS IS THE FOUND USER", foundUser);
  const createHandler = async (e) => {
    e.preventDefault();
    setCreatingRecord(true);
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify({
        name,
        weight,
        height,
        genotype,
        bloodGroup,
      }),
      process.env.NEXT_PUBLIC_CRYPTOJS_KEY
    ).toString();

    // Decrypt

    let result = await client.add(
      JSON.stringify({ name: "YOOCI RECORD", data: ciphertext })
    );
    createRecord(`https://yooci.infura-ipfs.io/ipfs/${result.path}`);
    setCreatingRecord(false);
  };
  const editHandler = async (e) => {
    e.preventDefault();
    setCreatingRecord(true);
    // Encrypt
    var ciphertext = CryptoJS.AES.encrypt(
      JSON.stringify({
        name,
        weight,
        height,
        genotype,
        bloodGroup,
      }),
      process.env.NEXT_PUBLIC_CRYPTOJS_KEY
    ).toString();

    // Decrypt

    let result = await client.add(
      JSON.stringify({ name: "YOOCI RECORD", data: ciphertext })
    );
    updateRecord(`https://yooci.infura-ipfs.io/ipfs/${result.path}`);
    setCreatingRecord(false);
  };

  const onSuccessVerified = (verificationResponse) => {
    console.log(verificationResponse);
    verifyUser(currentAccount);
  };
  return (
    <StyledProfile theme_={theme}>
      <Loader visible={editingProfile || creatingRecord} />
      <>
        <div className="profile">
          <div className="photo-cont">
            <img
              src={
                foundUser?.length > 2
                  ? `${foundUser?.[4]}`
                  : "/images/swing.jpeg"
              }
              className="cover"
              alt="img"
            />
            <div className="dp">
              <img
                src={
                  foundUser?.length > 2
                    ? `${foundUser?.[3]}`
                    : "/images/swing.jpeg"
                }
                className="cover img"
                alt="img"
              />
              <span className="bio">
                <h3>{foundUser?.length > 2 ? foundUser?.[2] : "Comrade"}</h3>
                <p>{foundUser?.[1]}</p>
              </span>
            </div>
            <div className="dpBtns">
              {currentAccount && (
                <button
                  className="secondary-btn"
                  onClick={() => disconnectWallet()}
                >
                  Disconnect
                </button>
              )}
              {currentAccount && (
                <button
                  className="secondary-btn"
                  onClick={() => setProfileModal(true)}
                >
                  Edit Profile
                </button>
              )}
              {currentAccount && (
                <div className="secondary-btn">
                  Verify Account
                  <WorldIDWidget
                    actionId="wid_staging_b0bb317d19a4a5de71193f47d896478f" // obtain this from developer.worldcoin.org
                    signal="my_signal"
                    enableTelemetry
                    onSuccess={(verificationResponse) =>
                      onSuccessVerified(verificationResponse)
                    }
                    onError={(error) => console.error(error)}
                    appName="Yooci"
                    signalDescription="Verify account"
                    theme="dark"
                    debug={true}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="nfts_section">
            <span className="tabs">
              <span
                className={`tab ${activeTab === "Health Records" && "active"}`}
                key="index"
                onClick={() => setActiveTab("Health Records")}
              >
                Health Records
                <div className="line"></div>
              </span>

              <span
                className={`tab ${activeTab === "User Nfts" && "active"}`}
                key="index"
                onClick={() => setActiveTab("User Nfts")}
              >
                User Nfts
                <div className="line"></div>
              </span>
            </span>
            <div className="section_2">
              {activeTab === "Health Records" ? (
                <div className="records">
                  {contractRecords ? (
                    <div className="active">
                      <div className="buttons">
                        <button onClick={() => setViewRecord(!viewRecord)}>
                          View Health Record
                        </button>

                        <button onClick={() => setAccessModal(true)}>
                          Control Access
                        </button>
                      </div>
                      {viewRecord ? (
                        <div className="view_record">
                          <form onSubmit={editHandler}>
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Name"
                              name="Name"
                              label="Name"
                              theme={theme}
                            />
                            <Input
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              placeholder="Weight in KG"
                              name="Weight"
                              label="Weight"
                              theme={theme}
                            />
                            <Input
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              placeholder="Height in feet"
                              name="Height"
                              label="Height"
                              theme={theme}
                            />
                            <Input
                              value={bloodGroup}
                              onChange={(e) => setBloodGroup(e.target.value)}
                              placeholder="Blood Group"
                              name="Blood Group"
                              label="Blood Group"
                              theme={theme}
                            />
                            <Input
                              value={genotype}
                              onChange={(e) => setGenotype(e.target.value)}
                              placeholder="Genotype"
                              name="Genotype"
                              label="Genotype"
                              theme={theme}
                            />
                            <button>Edit Record</button>
                          </form>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    <div className="inactive">
                      <h2>
                        You do not have any health records, create one here
                      </h2>
                      <form onSubmit={createHandler}>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name"
                          name="Name"
                          label="Name"
                          theme={theme}
                        />
                        <Input
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="Weight in KG"
                          name="Weight"
                          label="Weight"
                          theme={theme}
                        />
                        <Input
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="Height in feet"
                          name="Height"
                          label="Height"
                          theme={theme}
                        />
                        <Input
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          placeholder="Blood Group"
                          name="Blood Group"
                          label="Blood Group"
                          theme={theme}
                        />
                        <Input
                          value={genotype}
                          onChange={(e) => setGenotype(e.target.value)}
                          placeholder="Genotype"
                          name="Genotype"
                          label="Genotype"
                          theme={theme}
                        />
                        <button>Create Record</button>
                      </form>
                    </div>
                  )}
                </div>
              ) : activeTab === "User Nfts" ? (
                <div className="cards">
                  {userNfts?.map((nft, i) => (
                    <UserNftCard nft={nft} key={i} />
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        <AccessModal
          show={accessModal}
          onClose={() => setAccessModal(false)}
          user={foundUser}
        />
        <EditProfileModal
          show={profileModal}
          onClose={() => setProfileModal(false)}
          user={foundUser}
          setEditingProfile={setEditingProfile}
        />
      </>
    </StyledProfile>
  );
}
const StyledProfile = styled(motion.div)<{ theme_: boolean }>`
  display: flex;
  flex-flow: row wrap;
  min-height: 80vh;
  @media screen and (max-width: 900px) {
    padding: 0rem 0rem;
  }
  padding: 0rem 0rem;
  .profile {
    display: flex;
    flex-flow: column wrap;
    width: 100%;
    h3 {
      font-size: 1.3rem;
      font-weight: 500;
    }

    h3 {
      font-size: 1.3rem;
      font-weight: 500;
    }
    .body {
    }
    @media screen and (max-width: 900px) {
      width: 100%;
    }
    .header {
      display: flex;
      gap: 1rem;
      align-items: center;
      position: sticky;
      top: 0;
      padding: 1rem 2rem;
      @media screen and (max-width: 900px) {
        padding: 1rem 2rem;
      }
      .back {
        cursor: pointer;
      }
      z-index: 2;
      @media screen and (max-width: 900px) {
        display: flex;
        gap: 1rem;
        align-items: center;
        padding: 0.8rem 0rem;
        width: 100%;
      }
    }
    .photo-cont {
      height: 18rem;
      position: relative;
      margin-bottom: 0rem;
      .cover {
        display: block;
        object-fit: cover;
        height: 100%;
        width: 100%;
      }
      .dpBtns {
        position: absolute;
        bottom: 0%;
        right: 0%;
        padding: 2rem;
        display: flex;
        gap: 1rem;
        align-items: center;
        @media screen and (max-width: 900px) {
          display: flex;
          flex-direction: column;
        }
      }
      .dp {
        position: absolute;
        bottom: -80%;
        left: 4%;
        width: 22%;
        min-height: 15rem;
        border-radius: 1rem;
        border: 5px solid ${({ theme_ }) => (theme_ ? "#0f0f0f" : "#ffffff")};
        overflow: hidden;
        display: flex;
        cursor: pointer;
        background: ${({ theme_ }) =>
          theme_ ? "rgb(15, 15, 15,1)" : "rgb(255, 255, 255,1)"};
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        -moz-box-shadow: 0 0 4.5px #ccc;
        -webkit-box-shadow: 0 0 4.5px #ccc;
        box-shadow: 0 0 4.5px #ccc;
        @media screen and (max-width: 900px) {
          bottom: 3%;
          width: 10rem;
        }
        .bio {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .img {
          width: 9rem;
          height: 9rem;
          object-fit: cover;
          display: block;
          border-radius: 50%;
        }
        .edit {
          display: none;
          color: white;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2rem;
        }
        &:hover {
          img {
            opacity: 0.8;
          }

          .edit {
            display: block;
          }
        }
      }
    }

    img {
      display: block;
    }
    .nfts_section {
      display: flex;
      width: 75%;
      flex-direction: column;
      align-self: flex-end;
      padding: 2rem 3rem;
      @media screen and (max-width: 900px) {
        width: 100%;
        padding: 1rem 1rem;
      }
    }

    .tabs {
      display: flex;
      flex-flow: row wrap;
      gap: 1rem;
      width: 100%;
      .tab {
        padding: 0rem 1.2rem;
        padding-top: 0.5rem;
        font-size: 1.2rem;
        cursor: pointer;
        background: ${({ theme_ }) => (theme_ ? "#24242b" : "#f2f2f2")};
        -moz-box-shadow: 0 0 4.5px #ccc;
        -webkit-box-shadow: 0 0 4.5px #ccc;
        box-shadow: 0 0 4.5px #ccc;
        border-radius: 0.4rem;
        &:hover {
          color: gray;
        }
        .line {
          margin-top: 0.5rem;
          padding: 2px;
          background: inherit;
          border-radius: 3rem 3rem 0px 0px;
        }
        &.active {
          color: ${({ theme_ }) => (theme_ ? "black" : "white")};
          background: ${({ theme_ }) => (theme_ ? "#ffffff" : "#16161A")};
        }
      }
    }
  }
  .cards {
    width: 100%;
    padding: 2rem 0rem;

    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 1.5rem;
    grid-row-gap: 1.5rem;
    @media screen and (max-width: 900px) {
      grid-template-columns: repeat(1, 1fr);
      grid-column-gap: 0.5rem;
      grid-row-gap: 0.5rem;
      width: 100%;
      padding: 1rem 0rem;
    }
  }
  .section_2 {
    width: 100%;
    .cards {
      width: 100%;
      padding: 2rem 0rem;

      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-column-gap: 1.5rem;
      grid-row-gap: 1.5rem;
      @media screen and (max-width: 900px) {
        grid-template-columns: repeat(1, 1fr);
        grid-column-gap: 0.5rem;
        grid-row-gap: 0.5rem;
        width: 100%;
        padding: 1rem 0rem;
      }
    }
    .records {
      width: 100%;
      .active {
        display: flex;
        flex-direction: column;
        padding: 2rem 0rem;
        .buttons {
          display: flex;

          gap: 1rem;
        }
        .view_record {
          width: 50%;
          padding: 3rem 0rem;

          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
      }
      .inactive {
        width: 50%;
        padding: 3rem 0rem;

        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
    }
  }
`;
