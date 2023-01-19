import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

import Filter from "../components/Filter";
import { OrganizationCard } from "../components";
import AppContext from "../context/AppContext";

export default function Organizations() {
  const [sortBy, setSortBy] = useState("");
  const [organizations, setOrganizations] = useState();
  const { theme, getOrganizations } = useContext(AppContext);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const tempOrganizations = await getOrganizations();
    console.log("HERE ARE THE ORGANIZATIONS OOOooooooooooo", tempOrganizations);
    setOrganizations(tempOrganizations);
  };
  let organizationz = [{}];
  return (
    <StyledOrganizations theme_={theme}>
      <div className="main">
        <div className="header">
          <div className="left">
            <h2>Organizations</h2>
          </div>
          <div className="right"></div>
        </div>

        <div className="cards">
          {organizations?.map((organization: any, i) => (
            <OrganizationCard organization={organization} key={i} />
          ))}
        </div>
      </div>
    </StyledOrganizations>
  );
}

const StyledOrganizations = styled(motion.div)<{ theme_: boolean }>`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 2rem 4rem;
  gap: 2rem;
  @media screen and (max-width: 900px) {
    padding: 1rem 1rem;
  }
  .header {
    display: flex;
    justify-content: space-between;
    .left {
      @media screen and (max-width: 900px) {
        display: none;
      }
    }
    .right {
      display: flex;
      gap: 2rem;
      .filt {
        width: 8rem;
      }
    }
  }
  .cards {
    width: 100%;
    padding: 2rem 0rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
    @media screen and (max-width: 900px) {
      grid-template-columns: repeat(1, 1fr);
      grid-column-gap: 0.5rem;
      grid-row-gap: 0.5rem;
      width: 100%;
      padding: 0rem 0rem;
    }
  }
`;
