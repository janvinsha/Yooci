import React, { FC, useEffect, useContext, useState } from "react";
import { create } from "ipfs-http-client";
import { motion } from "framer-motion";
import styled from "styled-components";

import Input from "../components/Input";

import Textarea from "../components/Textarea";
import TagInput from "../components/TagInput";
import { Loader } from "../components";
import AppContext from "../context/AppContext";

import PhotoIcon from "@mui/icons-material/Photo";
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

const CreateCollection = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const { theme, createOrganization, creatingOrganization, currentAccount } =
    useContext(AppContext);

  const [dp, setDp] = useState();
  const [cover, setCover] = useState();
  const hiddenCoverInput = React.useRef(null);
  const hiddenDpInput = React.useRef(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!dp || !cover) {
      alert("Upload Cover photo and Banner");
      return;
    }

    let banner = await client.add(cover);
    let bannerUrl = `https://yooci.infura-ipfs.io/ipfs/${banner.path}`;
    let photo = await client.add(dp);
    let photoUrl = `https://yooci.infura-ipfs.io/ipfs/${photo.path}`;
    console.log("IPFS OBJECT", banner, photo);
    console.log("IPFS UPLOAD FILE BANNERURL", bannerUrl);

    console.log("IPFS UPLOAD FILE PHOTOURL", photoUrl);
    // console.log('FILES ARE HERE', files, dpFiles);

    console.log("Collection details", name, description, address);
    createOrganization({
      banner: bannerUrl,
      dp: photoUrl,
      name,
      description,
      address,
      owner: currentAccount,
    });
  };

  const handleDpClick = (event) => {
    hiddenDpInput.current.click();
  };

  const handleCoverClick = (event) => {
    hiddenCoverInput.current.click();
  };
  const uploadDpHandler = async (e) => {
    const file = e.target.files[0];
    console.log("This is the file", file);
    if (file.type.startsWith("image")) {
      setDp(
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
    }
  };
  const uploadCoverHandler = async (e) => {
    const file = e.target.files[0];
    console.log("This is the file", file);
    if (file.type.startsWith("image")) {
      setCover(
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
    }
  };
  return (
    <StyledCreateCollection theme_={theme}>
      <Loader visible={creatingOrganization} />
      <div className="page_header">
        <h2 className="page_title text-gradient">Create Organization</h2>
      </div>
      <div className="banner_div">
        <div className="banner_input ">
          <h3>Organization Banner</h3>
          <div className="box">
            {cover?.preview ? (
              <>
                <img src={cover?.preview} />
              </>
            ) : (
              <>
                <h3>PNG, JPEG, GIF, WEBP</h3>
                <h3>Max 100mb</h3>
                <PhotoIcon className="icon" />

                <h3> Click button select</h3>
                <button className="plain-btn" onClick={handleCoverClick}>
                  Select file
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <motion.div className="page_container">
        <div className="upload_div">
          <div className="dp_input ">
            <h3>Organization Photo</h3>
            <div className="box">
              {dp?.preview ? (
                <>
                  <img src={dp?.preview} />
                </>
              ) : (
                <>
                  <h3>PNG, JPEG, GIF, WEBP</h3>
                  <h3>Max 100mb</h3>
                  <PhotoIcon className="icon" />

                  <h3> Click button select</h3>
                  <button className="plain-btn" onClick={handleDpClick}>
                    Select file
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="preview_div">
          <form onSubmit={submitHandler}>
            <Input
              name="name"
              label="Name"
              asterik={true}
              placeholder="Organization Name"
              onChange={(e) => setName(e.target.value)}
              required
              theme={theme}
            />

            <Textarea
              name="description"
              label="Description"
              placeholder="Description..."
              className="text-area"
              role="textbox"
              asterik={true}
              rows={6}
              onChange={(e) => setDescription(e.target.value)}
              required
              theme={theme}
            />

            <Input
              name="Address"
              label="Address"
              asterik={true}
              placeholder="Organizations Address"
              onChange={(e) => setAddress(e.target.value)}
              required
              theme={theme}
            />

            <button type="submit">Create Organization</button>
          </form>
        </div>
      </motion.div>
      <input
        type="file"
        ref={hiddenDpInput}
        onChange={uploadDpHandler}
        style={{ display: "none" }}
      />
      <input
        type="file"
        ref={hiddenCoverInput}
        onChange={uploadCoverHandler}
        style={{ display: "none" }}
      />
    </StyledCreateCollection>
  );
};

const StyledCreateCollection = styled(motion.div)`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  padding: 2rem 6rem;
  gap: 2.5rem;
  @media screen and (max-width: 900px) {
    gap: 2rem;
  }
  .page_header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    @media screen and (max-width: 900px) {
      width: 100%;
    }
    h2 {
    }
  }
  .banner_div {
    padding: 0rem 6rem;
    @media screen and (max-width: 900px) {
      padding: 0rem 1rem;
    }
    .banner_input {
      display: flex;
      flex-flow: column wrap;
      gap: 1rem;
      .box {
        flex-flow: column wrap;

        /* border: 2px solid #7aedc7; */
        border-radius: 0.5rem;
        width: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;

        align-items: center;
        height: 10rem;
        border: 2.5px dashed #ccc;
        width: 100%;
        box-sizing: border-box;
        border-radius: 5px;
        margin-bottom: 2rem;
        background: ${({ theme_ }) => (theme_ ? "#24242b" : "#f2f2f2")};

        /* box-shadow: 0 0 3px #ccc; */
        h3 {
          font-size: 1.2rem;
        }
        img {
          width: 100%;
          display: block;
          object-fit: cover;
        }
      }
      .icon {
        font-size: 3rem;
      }
      .plain-btn {
        margin-top: 1rem;
        padding: 0.5rem 3rem;
      }
    }
  }
  .page_container {
    padding: 0rem 6rem;
    display: flex;
    flex-flow: row wrap;
    @media screen and (max-width: 900px) {
      flex-flow: column wrap;
      padding: 1rem 0rem;
      gap: 0rem;
    }
    h2 {
      font-size: 1.6rem;
      @media screen and (max-width: 900px) {
        font-size: 1.3rem;
      }
    }
    .upload_div {
      width: 50%;
      display: flex;
      flex-flow: column wrap;
      gap: 1rem;
      @media screen and (max-width: 900px) {
        width: 100%;
        padding: 1rem;
      }

      .dp_input {
        display: flex;
        flex-flow: column wrap;
        gap: 1rem;
        .box {
          flex-flow: column wrap;

          /* border: 2px solid #7aedc7; */

          border-radius: 0.5rem;
          width: 100%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 26rem;
          border: 2.5px dashed #ccc;
          width: 100%;
          box-sizing: border-box;
          border-radius: 5px;
          margin-bottom: 2rem;
          background: ${({ theme_ }) => (theme_ ? "#24242b" : "#f2f2f2")};
          /* box-shadow: 0 0 3px #ccc; */
          h3 {
            font-size: 1.2rem;
          }
          img {
            width: 100%;
            display: block;
            object-fit: cover;
          }
        }
        .icon {
          font-size: 5rem;
        }
        .plain-btn {
          margin-top: 1rem;
          padding: 0.5rem 3rem;
        }
      }
    }

    .preview_div {
      width: 50%;
      display: flex;
      flex-flow: column wrap;
      gap: 1rem;
      padding-left: 2rem;
      @media screen and (max-width: 900px) {
        width: 100%;
        padding-left: 0rem;
        padding: 1rem;
      }
      .listing-price {
        padding: 2rem 0.2rem;
        color: #d04bff;
      }
    }
  }
`;

export default CreateCollection;
