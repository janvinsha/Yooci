import React, { useContext, useEffect, useState } from "react";

import styled from "styled-components";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import AppContext from "../context/AppContext";

const OrganizationCard = ({ organization }) => {
  const { theme, currentAccount } = useContext(AppContext);
  const router = useRouter();
  console.log(
    "HERE IS THE ORGANIZATIONS IN THE ORGANIZATIONS CARD",
    organization
  );
  return (
    <StyledOrganizationCard
      theme_={theme}
      onClick={() =>
        router.push(`/organizations/${organization?.[0] || "5729"}`)
      }
    >
      <img src={organization?.[3] || "/images/yooci.png"} alt="img" />
      <div className="nft-desc">
        <span className="title">
          <h3>{organization?.[1] || "Yooci"}</h3>
          <h4></h4>
        </span>

        <span className="sale">
          <span className="author">
            <p>
              {organization?.[9]?.slice(0, 4) || "0x87b0B98"}...
              {organization?.[9]?.slice(-4) || "C24eee1Ce"}
            </p>{" "}
          </span>{" "}
          <p>Owner</p>
        </span>
      </div>
    </StyledOrganizationCard>
  );
};

const StyledOrganizationCard = styled(motion.div)<{ theme_: boolean }>`
  width: 100%;
  padding: 0rem 0rem;
  border-radius: 10px;
  display: flex;
  flex-flow: column wrap;
  gap: 1rem;
  background: ${({ theme_ }) =>
    theme_ ? "rgb(23, 24, 24,0.9)" : "rgb(248, 248, 248,0.9)"};
  background: ${({ theme_ }) => (theme_ ? "#24242b" : "#f2f2f2")};
  cursor: pointer;
  &:hover {
    -moz-box-shadow: 0 0 4.5px #ccc;
    -webkit-box-shadow: 0 0 4.5px #ccc;
    box-shadow: 0 0 4.5px #ccc;
  }
  overflow: hidden;
  img {
    height: 15rem;
    width: 100%;
    object-fit: cover;
  }
  height: auto;
  display: flex;
  flex-flow: column wrap;
  .nft-desc {
    display: flex;
    flex-flow: column wrap;
    padding: 0rem 1rem;
    gap: 0.5rem;
    .title,
    .sale {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      gap: 0.5rem;
      align-items: center;
      img {
        width: 1.5rem;
        height: 1.5rem;
        object-fit: cover;
        border-radius: 50%;
        @media screen and (max-width: 900px) {
          width: 1rem;
          height: 1rem;
        }
      }
    }
    .title {
      h3 {
        font-weight: 500;
      }
      p {
        color: #20b2aa;
      }
    }
    .sale {
      padding-bottom: 1rem;
      .author {
        display: flex;
        align-items: center;
        gap: 0.2rem;
      }
    }
  }
`;

export default OrganizationCard;
