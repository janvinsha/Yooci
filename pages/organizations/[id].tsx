import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import styled from "styled-components";
import CryptoJS from "crypto-js";
import { create } from "ipfs-http-client";
import { WidgetProps } from "@worldcoin/id";
import AppContext from "../../context/AppContext";

import {
  UserNftCard,
  NftCard,
  EditProfileModal,
  Loader,
  Input,
  EditOrgModal,
} from "../../components";

import { verify } from "crypto";
import { Streetview } from "@mui/icons-material";

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
  const [activeTab, setActiveTab] = useState("User Records");
  const {
    currentAccount,
    theme,
    disconnectWallet,
    createTable,
    getProfile,
    chainId,
    getRecord,
    verifyOrganization,
    getOrganization,
  } = useContext(AppContext);
  const [foundOrg, setFoundOrg] = useState();
  const [orgModal, setOrgModal] = useState(false);
  const [view, setView] = useState();
  const [activeView, setActiveView] = useState(false);
  const { pathname } = router;
  const { id: orgId } = router.query;

  useEffect(() => {
    getOrganizationDetails();
    getData();
  }, [currentAccount]);

  const getOrganizationDetails = async () => {
    if (currentAccount) {
      const res = await getOrganization(`${orgId}`);
      console.log("GET PRFOILE RESPOMSE HERE", res);
      setFoundOrg(res?.[0]);
    }
  };
  const getData = async () => {};

  const onSuccessVerified = (verificationResponse) => {
    console.log(verificationResponse);
    verifyOrganization(currentAccount);
  };
  let userRecords = [{}];
  let viewRecordHandler = ({ id, i }) => {
    setActiveView(!activeView);
    setView(i);
  };
  return (
    <StyledOrganization theme_={theme}>
      <Loader />
      <>
        <div className="profile">
          <div className="photo-cont">
            <img
              src={
                foundOrg?.length > 2 ? `${foundOrg?.[4]}` : "/images/swing.jpeg"
              }
              className="cover"
              alt="img"
            />
            <div className="dp">
              <img
                src={
                  foundOrg?.length > 2
                    ? `${foundOrg?.[3]}`
                    : "/images/swing.jpeg"
                }
                className="cover img"
                alt="img"
              />
              <span className="bio">
                <h3>{foundOrg?.length > 2 ? foundOrg?.[2] : "Yooci Org"}</h3>
                <p>{foundOrg?.[1]}</p>
              </span>
            </div>
            <div className="dpBtns">
              {currentAccount == foundOrg?.[5] && (
                <button
                  className="secondary-btn"
                  onClick={() => setProfileModal(true)}
                >
                  Edit Organization
                </button>
              )}
              {currentAccount == foundOrg?.[5] && (
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
                className={`tab ${activeTab === "User Records" && "active"}`}
                key="index"
                onClick={() => setActiveTab("User Records")}
              >
                User Records
                <div className="line"></div>
              </span>
            </span>
            <div className="section_2">
              {activeTab === "User Records" ? (
                <div className="records">
                  {userRecords.map((record, i) => (
                    <div className="record" key={i}>
                      <span className="row">
                        <h2>Name:</h2>
                        <h3>Jande Vincent</h3>
                      </span>

                      <span>
                        {" "}
                        <button
                          onClick={() =>
                            viewRecordHandler({ id: record?.id, i })
                          }
                        >
                          View Record
                        </button>
                      </span>
                      {activeView && view == i && (
                        <div className="main">
                          <span className="row">
                            <h2>Name:</h2>
                            <h3>Jande Vincent</h3>
                          </span>
                          <span className="row">
                            <h2>Genotype:</h2>
                            <h3>AA</h3>
                          </span>
                          <span className="row">
                            <h2>Weight:</h2>
                            <h3>63kg</h3>
                          </span>
                          <span className="row">
                            <h2>Height:</h2>
                            <h3> 5.8</h3>
                          </span>
                          <span className="row">
                            <h2>Bloog group:</h2>
                            <h3>A+</h3>
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </>
      <EditOrgModal
        show={orgModal}
        onClose={() => setOrgModal(false)}
        org={foundOrg}
      />
    </StyledOrganization>
  );
}
const StyledOrganization = styled(motion.div)<{ theme_: boolean }>`
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
      gap: 2rem;
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
    .records {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      .record {
        border-radius: 0.4rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;

        -moz-box-shadow: 0 0 4.5px #ccc;
        -webkit-box-shadow: 0 0 4.5px #ccc;
        box-shadow: 0 0 4.5px #ccc;
        padding: 2rem 2rem;
        .row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
      }
    }
  }
`;
